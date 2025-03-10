import { Repository } from "typeorm";
import { BerachainOrderService } from "./impl/bera/BerachainOrderService";
import { TransferOrder } from "src/modules/order/entities/transfer-order.entity";
import { WithdrawalOrder } from "src/modules/order/entities/withdrawal-order.entity";
import { SwapOrder } from "src/modules/order/entities/swap-order.entity";
import { TokenService } from "src/modules/token/token.service";
import { IWalletService } from "../wallet/IWalletService";
import { NotFoundException } from "@nestjs/common";
import { PairService } from "src/modules/pair/pair.service";
import { A8OrderService } from "./impl/a8/A8OrderService";
import { MetisOrderService } from "./impl/metis/MetisOrderService";
import { ARBOrderService } from "./impl/arb/ArbOrderService";

export class OrderServiceFactory {
    constructor(
        readonly transferRepo: Repository<TransferOrder>,
        readonly withdrawalRepo: Repository<WithdrawalOrder>,
        readonly swapRepo: Repository<SwapOrder>,
        readonly tokenService: TokenService,
        readonly pairService: PairService,
        readonly walletService: IWalletService
    ) { }
    getOrderService(
        chain: string,
    ) {
        switch (chain) {
            case "berachain":
                return new BerachainOrderService(
                    this.transferRepo, this.withdrawalRepo, this.swapRepo, this.tokenService, this.pairService, this.walletService
                )
            case "a8":
                return new A8OrderService(
                    this.transferRepo, this.withdrawalRepo, this.swapRepo, this.tokenService, this.pairService, this.walletService
                )
            case "metis":
                return new MetisOrderService(
                    this.transferRepo, this.withdrawalRepo, this.swapRepo, this.tokenService, this.pairService, this.walletService
                )
            case "arbitrum":
                return new ARBOrderService(
                    this.transferRepo, this.withdrawalRepo, this.swapRepo, this.tokenService, this.pairService, this.walletService
                )
            default: {
                throw new NotFoundException("Chain is not supported")
            }
        }
    }
}