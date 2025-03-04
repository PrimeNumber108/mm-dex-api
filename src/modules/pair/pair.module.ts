import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Pair } from "./pair.entity";
import { PairController } from "./pair.controller";
import { PairService } from "./pair.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([Pair])
  ],
  controllers: [PairController],
  providers: [PairService],
  exports: [PairService],
})
export class PairModule {}
