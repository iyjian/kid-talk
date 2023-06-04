import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const ReqUserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request['locals']['user']['id'];
  },
);
