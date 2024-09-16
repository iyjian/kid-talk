import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { Request } from 'express'

export interface Response<T> {
  err: number
  errMsg?: string
  data?: T
}

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  private readonly logger = new Logger(TransformInterceptor.name)
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const contextType = context.getType<'http' | 'rmq'>()
    if (contextType === 'http') {
      /**
       * HTTP 语境下的响应转化
       */
      const request: Request = context.switchToHttp().getRequest<Request>()
      const url = request.originalUrl
      if (
        url === '/swagger' ||
        request.get('x-response-format') === 'bare' ||
        /^\/proxy/.test(url)
      ) {
        /**
         * swagger文档是json格式, 用于其他工具直接导入, 不能做transform
         * 显示指定返回数据格式为bare，也不做转化
         */
        return next.handle()
      } else {
        return next.handle().pipe(map((data) => ({ err: 0, data })))
      }
    } else if (contextType === 'rmq') {
      return next.handle()
    } else {
      return next.handle()
    }
  }
}
