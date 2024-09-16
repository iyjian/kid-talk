import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { SUPER_ADMIN_USER } from '../interfaces'

export const ReqUserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>() as any
    if (request?.locals?.user?.id) {
      return request['locals']['user']['id']
    } else SUPER_ADMIN_USER
  },
)

export const ReqUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>() as any
    if (request?.locals?.user?.id) {
      return request['locals']['user']
    } else {
      return SUPER_ADMIN_USER
    }
  },
)
