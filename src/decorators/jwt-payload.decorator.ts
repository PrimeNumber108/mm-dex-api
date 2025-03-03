import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserPublicDto } from 'src/modules/user/dtos/user.dto';

export const JwtPayload = createParamDecorator(
  (_: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    return request.user as UserPublicDto;
  },
);
