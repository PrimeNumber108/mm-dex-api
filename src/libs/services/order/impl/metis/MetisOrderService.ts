import { Repository } from "typeorm";
import { BaseEVMOrderService } from "../BaseEVMOrderService";
import { TransferOrder } from "src/modules/order/entities/transfer-order.entity";
import { WithdrawalOrder } from "src/modules/order/entities/withdrawal-order.entity";
import { SwapOrder } from "src/modules/order/entities/swap-order.entity";
import { TokenService } from "src/modules/token/token.service";
import { IWalletService } from "src/libs/services/wallet/IWalletService";
import { CreateBatchedSwapOrderDto, CreateSwapOrderDto, SwapOrderResponseDto } from "src/modules/order/dtos/swap-order.dto";
import { NotFoundException } from "@nestjs/common";
import { parseUnits, Wallet } from "ethers";
import { PairService } from "src/modules/pair/pair.service";
import { HerculesV2Swapper } from "./HerculesV2Swapper";
import { IEVMSwapper } from "../../IEVMSwapper";

export class MetisOrderService extends BaseEVMOrderService {
    constructor(
        transferRepo: Repository<TransferOrder>,
        withdrawalRepo: Repository<WithdrawalOrder>,
        swapRepo: Repository<SwapOrder>,
        tokenService: TokenService,
        pairService: PairService,
        walletService: IWalletService
    ) {
        super("metis", transferRepo, withdrawalRepo, swapRepo, tokenService, pairService, walletService);
    }

    getSwapper(protocol: string): IEVMSwapper {
        switch (protocol) {
            case "hercules-v2": {
                return new HerculesV2Swapper();
            }

            default: {
                throw new NotFoundException("Protocol is not supported");
            }
        }
    }
}