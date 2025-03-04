import { Module } from "@nestjs/common";
import { WalletController } from "./wallet.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Wallet } from "./wallet.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Wallet])
  ],
  controllers: [WalletController],
  providers: [],
  exports: [],
})
export class WalletModule {}
