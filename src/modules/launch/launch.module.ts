import { Module } from "@nestjs/common";
import { LaunchController } from "./launch.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Launch } from "./launch.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Launch])
  ],
  controllers: [LaunchController],
  providers: [],
  exports: [TypeOrmModule],
})
export class LaunchModule {}
