import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export const ReqUserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>()
    console.log(request['locals'])
    return request['locals']['user']['id']
  },
)
