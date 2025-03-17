import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { RolesGuard } from './guards/roles.guard';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wallet } from '../wallet/wallet.entity';

@Module({
  imports: [
    UserModule,
    TypeOrmModule.forFeature([Wallet])
  ],
  providers: [RolesGuard],
  exports: [RolesGuard], // Export so AppModule can use it
})
export class AuthModule {}
