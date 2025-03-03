import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from 'src/decorators/roles.decorator';
import { UserRole, User } from '../user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const apiSecret = request.headers['x-api-secret'];

    if (!apiSecret) {
      throw new UnauthorizedException('API secret is required');
    }

    // 🔹 Find user by API secret
    const user = await this.userRepository.findOne({ where: { apiSecret } });

    if (!user) {
      throw new UnauthorizedException('Invalid API secret');
    }

    if (!user.role) {
      throw new ForbiddenException('User role not found');
    }

    // 🔹 Check if user has required role
    const hasRole = requiredRoles.includes(user.role);
    if (!hasRole) {
      throw new ForbiddenException(`User role ${user.role} is not allowed to access this resource`);
    }

    return true;
  }
}
