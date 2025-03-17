import { Injectable, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from 'src/decorators/roles.decorator';
import { UserRole } from '../../user/user.entity';
import { UserService } from 'src/modules/user/user.service';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Wallet } from 'src/modules/wallet/wallet.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RolesGuard {
  constructor(
    private reflector: Reflector,
    private readonly userService: UserService,
    @InjectRepository(Wallet)
    private readonly walletRepo: Repository<Wallet>
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();
    const apiSecret = request.headers['x-api-secret'];
    const username = request.headers['username'];
    const body = request.body;

    if (!apiSecret || !username) {
      throw new UnauthorizedException('API secret and username are required.');
    }

    // 🔹 Validate user
    const user = await this.userService.findUser(username);
    if (!user?.apiSecretHash) {
      throw new UnauthorizedException('User not found or missing API secret.');
    }

    const isSecretValid = await bcrypt.compare(apiSecret, user.apiSecretHash);
    if (!isSecretValid) {
      throw new UnauthorizedException('Invalid API secret.');
    }

    if (!user.role) {
      throw new ForbiddenException('User role is missing.');
    }

    // 🔹 Admin bypasses all checks
    if (user.role === UserRole.ADMIN) return true;

    // 🔹 Validate clusters for GUEST role
    if (user.role === UserRole.GUEST) {
      await this.validateGuestAccess(user.allowedClusters ?? [], body);
    }

    // 🔹 Role-based access control
    if (!requiredRoles || requiredRoles.includes(user.role)) {
      return true;
    }

    throw new ForbiddenException(`User role ${user.role} is not allowed to access this resource.`);
  }

  private async validateGuestAccess(allowedClusters: string[], body: any) {
    const { senders, account } = body;

    // 🔹 Validate single cluster
    if (senders?.cluster && !allowedClusters.includes(senders.cluster)) {
      throw new UnauthorizedException(`Access denied to cluster: ${senders.cluster}`);
    }

    // 🔹 Validate multiple accounts
    const accountAddresses = senders?.accounts || (account ? [account] : []);
    if (accountAddresses.length > 0) {
      const wallets = await this.walletRepo
        .createQueryBuilder('wallet')
        .where('wallet.address IN (:...addresses)', { addresses: accountAddresses })
        .getMany();

      for (const wallet of wallets) {
        if (!allowedClusters.includes(wallet.cluster)) {
          throw new UnauthorizedException(`Access denied to cluster: ${wallet.cluster}`);
        }
      }
    }
  }
}
