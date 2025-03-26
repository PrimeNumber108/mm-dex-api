import { Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { User } from "./user.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from '../auth/auth.module'; // Add this import
import { UserService } from "./user.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        AuthModule
    ],
    controllers: [UserController],
    providers: [
        UserService,
    ],
    exports: [UserService],
})
export class UserModule { }
