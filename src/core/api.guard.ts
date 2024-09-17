import {
  CanActivate,
  ExecutionContext,
  Injectable,
  HttpException,
  Logger,
} from '@nestjs/common'
import { Request } from 'express'
import { ConfigService } from '@nestjs/config'
import { WsException } from '@nestjs/websockets'
import { AuthenticationClient } from 'authing-js-sdk'

@Injectable()
export class ApiGuard implements CanActivate {
  private readonly logger = new Logger(ApiGuard.name)
  private readonly authing = new AuthenticationClient({
    appId: '',
    appHost: '',
  })
  // {
  //   appId: this.configService.get('auth.authingAppId'),
  //   appHost: this.configService.get('auth.authingAppHost'),
  // }

  constructor(private readonly configService: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // console.log(context.getType());
    if (context.getType() === 'http') {
      const request = context.switchToHttp().getRequest<Request>()

      if (
        request.path === '/phraseSentence/unit' ||
        request.path === '/phraseSentence'
      ) {
        return true
      }

      const token = request.headers['token'] as string
      if (
        this.configService.get('auth.superToken') &&
        token === this.configService.get('auth.superToken')
      ) {
        this.logger.debug(`apiGuard - superToken`)
        return true
      }

      /**
       * AUTHING 认证
       */
      const { status } = await this.authing.checkLoginStatus(token)

      if (status) {
        this.logger.debug(`apiGuard - success`)
        return true
      } else {
        this.logger.debug(`apiGuard - canActivate - token: ${token}`)
        throw new HttpException('未登录', 700)
      }
    } else if (context.getType() === 'ws') {
      const token = context.switchToWs().getClient().handshake.query.token
      if (
        this.configService.get('auth.superToken') &&
        token === this.configService.get('auth.superToken')
      ) {
        return true
      }

      /**
       * AUTHING 认证
       */
      const { status } = await this.authing.checkLoginStatus(token)
      // console.log(await this.authing.checkLoginStatus(token));

      if (status) {
        return true
      } else {
        this.logger.debug(`apiGuard - canActivate - token: ${token}`)
        throw new WsException('未登录')
      }
    } else {
      return false
    }
  }
}
