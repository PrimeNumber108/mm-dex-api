import { Repository } from "typeorm";
import { BaseEVMOrderService } from "../BaseEVMOrderService";
import { TransferOrder } from "src/modules/order/entities/transfer-order.entity";
import { WithdrawalOrder } from "src/modules/order/entities/withdrawal-order.entity";
import { SwapOrder } from "src/modules/order/entities/swap-order.entity";
import { TokenService } from "src/modules/token/token.service";
import { IWalletService } from "src/libs/services/wallet/IWalletService";
import { NotFoundException } from "@nestjs/common";
import { KodiakSwapper } from "./KodiakV2Swapper";
import { HoldsoSwapper } from "./HoldsoSwapper";
import { PairService } from "src/modules/pair/pair.service";
import { IEVMSwapper } from "../../IEVMSwapper";

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

    getSwapper(protocol: string): IEVMSwapper {
        switch (protocol) {
            case "kodiak-v2": {
                return new KodiakSwapper();
            }
            case "holdso": {
                return new HoldsoSwapper();
            }

            default: {
                throw new NotFoundException("Protocol is not supported");
            }
        }
    }
}