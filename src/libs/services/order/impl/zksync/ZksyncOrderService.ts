import { Repository } from "typeorm";
import { BaseEVMOrderService } from "../BaseEVMOrderService";
import { TransferOrder } from "src/modules/order/entities/transfer-order.entity";
import { WithdrawalOrder } from "src/modules/order/entities/withdrawal-order.entity";
import { SwapOrder } from "src/modules/order/entities/swap-order.entity";
import { TokenService } from "src/modules/token/token.service";
import { IWalletService } from "src/libs/services/wallet/IWalletService";
import { NotFoundException } from "@nestjs/common";
import { PairService } from "src/modules/pair/pair.service";
import { IEVMSwapper } from "../../IEVMSwapper";
import { SyncswapSwapper } from "./SyncswapSwapper";

export class ZksyncOrderService extends BaseEVMOrderService {
    constructor(
        transferRepo: Repository<TransferOrder>,
        withdrawalRepo: Repository<WithdrawalOrder>,
        swapRepo: Repository<SwapOrder>,
        tokenService: TokenService,
        pairService: PairService,
        walletService: IWalletService
    ) {
        super("zksync", transferRepo, withdrawalRepo, swapRepo, tokenService, pairService, walletService);
    }

    getSwapper(protocol: string): IEVMSwapper {
        switch (protocol) {
            case "syncswap": {
                return new SyncswapSwapper();
            }

            default: {
                throw new NotFoundException("Protocol is not supported");
            }
        }
    }
}