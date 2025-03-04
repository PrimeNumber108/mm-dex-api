import { Repository } from "typeorm";
import { BerachainOrderService } from "./impl/bera/BerachainOrderService";
import { TransferOrder } from "src/modules/order/entities/transfer-order.entity";
import { WithdrawalOrder } from "src/modules/order/entities/withdrawal-order.entity";
import { SwapOrder } from "src/modules/order/entities/swap-order.entity";
import { TokenService } from "src/modules/token/token.service";
import { IWalletService } from "../wallet/IWalletService";
import { NotFoundException } from "@nestjs/common";

export class OrderServiceFactory {
    constructor(
        readonly transferRepo: Repository<TransferOrder>,
        readonly withdrawalRepo: Repository<WithdrawalOrder>,
        readonly swapRepo: Repository<SwapOrder>,
        readonly tokenService: TokenService,
        readonly walletService: IWalletService
    ) { }
    getOrderService(
        chain: string,
    ) {
        switch (chain) {
            case "berachain":
                return new BerachainOrderService(
                    this.transferRepo, this.withdrawalRepo, this.swapRepo, this.tokenService, this.walletService
                )

            default: {
                throw new NotFoundException("Chain is not supported")
            }
        }
    }
}