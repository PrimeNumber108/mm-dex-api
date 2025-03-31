import { Module } from "@nestjs/common";
import { LaunchController } from "./launch.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Launch } from "./launch.entity";
import { WalletModule } from '../wallet/wallet.module';  

@Module({
  imports: [
    TypeOrmModule.forFeature([Launch]), WalletModule
  ],
  controllers: [LaunchController],
  providers: [],
  exports: [TypeOrmModule],
})
export class LaunchModule {}
