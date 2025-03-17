import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { RolesGuard } from './guards/roles.guard';
import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports: [
    UserModule,
    WalletModule
  ],
  providers: [RolesGuard],
  exports: [RolesGuard], // Export so AppModule can use it
})
export class AuthModule {}
