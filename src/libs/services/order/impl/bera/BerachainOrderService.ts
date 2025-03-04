import { Repository } from "typeorm";
import { BaseEVMOrderService } from "../BaseEVMOrderService";
import { TransferOrder } from "src/modules/order/entities/transfer-order.entity";
import { WithdrawalOrder } from "src/modules/order/entities/withdrawal-order.entity";
import { SwapOrder } from "src/modules/order/entities/swap-order.entity";
import { TokenService } from "src/modules/token/token.service";
import { IWalletService } from "src/libs/services/wallet/IWalletService";
import { CreateSwapOrderDto, SwapOrderResponseDto } from "src/modules/order/dtos/swap-order.dto";
import { NotFoundException } from "@nestjs/common";
import { KodiakSwapper } from "./KodiakV2Swapper";
import { parseUnits } from "ethers";
import { HoldsoSwapper } from "./HoldsoSwapper";
import { PairService } from "src/modules/pair/pair.service";

export class BerachainOrderService extends BaseEVMOrderService {
    constructor(
        transferRepo: Repository<TransferOrder>,
        withdrawalRepo: Repository<WithdrawalOrder>,
        swapRepo: Repository<SwapOrder>,
        tokenService: TokenService,
        pairService: PairService,
        walletService: IWalletService
    ) {
        super("berachain", transferRepo, withdrawalRepo, swapRepo, tokenService, pairService, walletService);
    }

    async executeSwap(params: CreateSwapOrderDto): Promise<SwapOrderResponseDto> {
        const tokenIn = await this.tokenService.assertKnownToken({ address: params.tokenIn, chain: this.chain });
        const tokenOut = await this.tokenService.assertKnownToken({ address: params.tokenOut, chain: this.chain });
        const recipient = await this.walletService.assertKnownAccount({
            address: params.recipient
        })
        const wallet = await this.getSrcWallet(params);
        let txHash: string;
        switch (params.protocol) {
            case "kodiak-v2": {
                txHash = await KodiakSwapper.executeSwap(
                    wallet,
                    params.tokenIn,
                    params.tokenOut,
                    parseUnits(params.amountIn, tokenIn.decimals),
                    parseUnits(params.amountOutMin, tokenOut.decimals),
                    recipient
                );
                break;
            }
            case "holdso": {
                const isTokenIn0 = BigInt(params.tokenIn) < BigInt(params.tokenOut);

                const pair = await this.pairService.assertKnownPair({
                    chain: params.chain,
                    protocol: params.protocol,
                    token0: isTokenIn0 ? params.tokenIn : params.tokenOut,
                    token1: isTokenIn0 ? params.tokenOut : params.tokenIn
                })
                txHash = await HoldsoSwapper.executeSwap(
                    wallet,
                    params.tokenIn,
                    params.tokenOut,
                    BigInt(pair.fee),
                    parseUnits(params.amountIn, tokenIn.decimals),
                    parseUnits(params.amountOutMin, tokenOut.decimals),
                    recipient
                );
                break;
            }

            default: {
                throw new NotFoundException("Protocol is not supported");
            }
        }

        const creationDto: CreateSwapOrderDto = {
            ...params,
            txHash
        }

        return await this.swapRepo.save(this.swapRepo.create(creationDto));
    }
    async executeSwapsInBatch(params: CreateSwapOrderDto[]): Promise<SwapOrderResponseDto[]> {
        return await Promise.all(params.map(p => this.executeSwap(p)))
    }
}