import { Module } from "@nestjs/common";
import { OrderController } from "./order.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TokenModule } from "../token/token.module";
import { TransferOrder } from "./entities/transfer-order.entity";
import { WithdrawalOrder } from "./entities/withdrawal-order.entity";
import { SwapOrder } from "./entities/swap-order.entity";
import { Wallet } from "../wallet/wallet.entity";
import { PairModule } from "../pair/pair.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([
        TransferOrder,
        WithdrawalOrder,
        SwapOrder,
        Wallet
    ]),
    TokenModule,
    PairModule
  ],
  controllers: [OrderController],
  providers: [],
  exports: [],
})
export class OrderModule {}
