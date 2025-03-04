import { Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { User } from "./user.entity";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
  imports: [
    TypeOrmModule.forFeature([User])
  ],
  controllers: [UserController],
  providers: [],
  exports: [],
})
export class UserModule {}
