import { Injectable, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from 'src/decorators/roles.decorator';
import { UserRole } from '../../user/user.entity';
import { UserService } from 'src/modules/user/user.service';
import * as bcrypt from 'bcrypt'; // Import bcrypt for hashing & verification

@Injectable()
export class RolesGuard {
  constructor(
    private reflector: Reflector,
    private readonly userSerive: UserService
  ) {
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();
    const apiSecret = request.headers['x-api-secret'];
    const username = request.headers['username'];

    if (!apiSecret || !username) {
      throw new UnauthorizedException('API secret & username are required');
    }

    // 🔹 Find user by API secret
    const user = await this.userSerive.findUser(username);

    if (!user?.apiSecretHash) {
      throw new UnauthorizedException('User not found');
    }

    const isSecretValid = await bcrypt.compare(apiSecret, user.apiSecretHash);
    if (!isSecretValid) {
      throw new UnauthorizedException('Invalid API secret');
    }

    if (!user?.role) {
      throw new ForbiddenException('User role not found');
    }
    if(user.role === UserRole.ADMIN) return true;

    if(!requiredRoles) return true;
    // 🔹 Check if user has required role
    const hasRole = requiredRoles.includes(user.role);
    if (!hasRole) {
      throw new ForbiddenException(`User role ${user.role} is not allowed to access this resource`);
    }

    return true;
  }
}
