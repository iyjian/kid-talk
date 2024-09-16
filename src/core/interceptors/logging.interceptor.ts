// import {
//   Injectable,
//   NestInterceptor,
//   ExecutionContext,
//   CallHandler,
//   Logger,
// } from '@nestjs/common'
// import moment from 'moment'
// import { AuthingRequest } from '../interfaces'
// import { AsyncClientService } from './../../features/async-client'

// @Injectable()
// export class LoggingInterceptor implements NestInterceptor {
//   private readonly logger = new Logger()

//   constructor(private readonly asyncClientService: AsyncClientService) {}

//   async intercept(context: ExecutionContext, next: CallHandler): Promise<any> {
//     const contextType = context.getType<'http' | 'rmq'>()

//     if (contextType === 'http') {
//       /**
//        * HTTP 语境下的日志记录
//        */
//       const request: AuthingRequest = context
//         .switchToHttp()
//         .getRequest<AuthingRequest>()
//       const method = request.method
//       if (request.method === 'GET') {
//         for (const key in request.query) {
//           /**
//            * 将请求中的 equipment_name=xxxx 改为 equipment.name=xxxxx
//            */
//           if (key.indexOf('_') !== -1) {
//             request.query[key.replace(/_/g, '.')] = request.query[key]
//             delete request.query[key]
//           }
//         }
//       }
//       try {
//         const url = request.originalUrl
//         const ip = request.ip
//         const path = request.path
//         const requestDate = moment().format('YYYY-MM-DD HH:mm:ss')
//         const trimmedPayload = JSON.stringify(request.body).substring(0, 1000)

//         if (
//           (method === 'POST' && /problem\/upload/.test(path)) ||
//           method === 'GET'
//         ) {
//           this.logger.verbose(
//             `${method} - ${path} - ${url} - ${ip} - ${trimmedPayload} - skipped`,
//           )
//         } else {
//           this.logger.verbose(
//             `logging - method:${method} path:${path} url:${url} ip:${ip} trimmedPayload:${trimmedPayload}`,
//           )
//           await this.asyncClientService.sendLog({
//             id: request?.headers?.requestId.toString(),
//             requestDate,
//             userId: request?.locals?.user?.id,
//             method,
//             path,
//             url,
//             ip,
//             payload: trimmedPayload,
//           })
//         }
//       } catch (e) {
//         console.log(e)
//       }
//     }

//     return next.handle()
//   }
// }
