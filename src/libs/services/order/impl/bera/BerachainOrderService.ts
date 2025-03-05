import { Repository } from "typeorm";
import { BaseEVMOrderService } from "../BaseEVMOrderService";
import { TransferOrder } from "src/modules/order/entities/transfer-order.entity";
import { WithdrawalOrder } from "src/modules/order/entities/withdrawal-order.entity";
import { SwapOrder } from "src/modules/order/entities/swap-order.entity";
import { TokenService } from "src/modules/token/token.service";
import { IWalletService } from "src/libs/services/wallet/IWalletService";
import { CreateBatchedSwapOrderDto, CreateSwapOrderDto, SwapOrderResponseDto } from "src/modules/order/dtos/swap-order.dto";
import { NotFoundException } from "@nestjs/common";
import { KodiakSwapper } from "./KodiakV2Swapper";
import { id, parseUnits, Wallet } from "ethers";
import { HoldsoSwapper } from "./HoldsoSwapper";
import { PairService } from "src/modules/pair/pair.service";
import { Web3Helper } from "src/libs/services/web3";

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
                const {
                    token0,
                    token1
                } = Web3Helper.getTokensInRightOrder(this.chain, params.tokenIn, params.tokenOut);

                const pair = await this.pairService.assertKnownPair({
                    chain: params.chain,
                    protocol: params.protocol,
                    token0,
                    token1
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
    async executeSwapsInBatch(params: CreateBatchedSwapOrderDto): Promise<SwapOrderResponseDto[]> {
        const tokenIn = await this.tokenService.assertKnownToken({ address: params.tokenIn, chain: this.chain });
        const tokenOut = await this.tokenService.assertKnownToken({ address: params.tokenOut, chain: this.chain });
        const recipients = await this.walletService.assertKnownAccounts({
            accounts: params.items.map(o => o.recipient)
        });
        const wallets = await this.walletService.assertWalletsForExecution({
            accounts: params.items.map(o => o.account)
        })
        const feeData = await this.provider.getFeeData();
        const gasPrice = feeData.gasPrice;
        const signedTxs = await Promise.all(wallets.map(async (wallet, idx) => {
            const recipient = recipients[idx];
            const amountIn = parseUnits(params.items[0].amountIn, tokenIn.decimals);
            const amountOutMin = parseUnits(params.items[0].amountOutMin, tokenIn.decimals);

            switch (params.protocol) {
                case "kodiak-v2": {
                    return await KodiakSwapper.prepareForSwap(
                        new Wallet(wallet.privateKey, this.provider),
                        tokenIn.address,
                        tokenOut.address,
                        amountIn,
                        amountOutMin,
                        gasPrice,
                        recipient
                    )
                }
                case "holdso": {
                    const {
                        token0,
                        token1
                    } = Web3Helper.getTokensInRightOrder(this.chain, params.tokenIn, params.tokenOut);

                    const pair = await this.pairService.assertKnownPair({
                        chain: this.chain,
                        protocol: params.protocol,
                        token0,
                        token1
                    })

                    return await HoldsoSwapper.prepareForSwap(
                        new Wallet(wallet.privateKey, this.provider),
                        tokenIn.address,
                        tokenOut.address,
                        BigInt(pair.fee),
                        amountIn,
                        amountOutMin,
                        gasPrice,
                        recipient
                    )
                }

                default: {
                    throw new NotFoundException("Protocol is not supported");
                }
            }
        }));

        const responses = await Promise.all(signedTxs.map(tx => this.provider.broadcastTransaction(tx)));
        const txHashes = responses.map(res => res.hash);
        const creationDtos: CreateSwapOrderDto[] = txHashes.map((txHash, idx) => {
            const dto: CreateSwapOrderDto = {
                txHash,
                tokenIn: params.tokenIn,
                tokenOut: params.tokenOut,
                recipient: params.items[idx].recipient,
                protocol: params.protocol,
                amountIn: params.items[idx].amountIn,
                amountOutMin: params.items[idx].amountOutMin,
                username: params.username,
                chain: params.chain,
                account: params.items[idx].account
            }

            return dto;
        })

        return await this.swapRepo.save(this.swapRepo.create(creationDtos));
    }
}