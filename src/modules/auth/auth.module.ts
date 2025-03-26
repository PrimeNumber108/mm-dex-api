import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { RolesGuard } from './guards/roles.guard';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports: [
    forwardRef(() => UserModule), // Use forwardRef to avoid circular dependency
    WalletModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [AuthService, RolesGuard],
  controllers: [AuthController],
  // exports: [RolesGuard], // Export RolesGuard to be used in other modules
  exports: [
    AuthService, 
    JwtModule,  
    RolesGuard,
  ],
})
export class AuthModule {}
