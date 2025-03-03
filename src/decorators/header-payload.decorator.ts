import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export type HeaderPayloadType = {
  username: string,
  chain: string
}
export const HeaderPayload = createParamDecorator(
  (_: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    return {
      username: request.headers['username'],
      chain: request.headers['chain']
    };
  },
);
