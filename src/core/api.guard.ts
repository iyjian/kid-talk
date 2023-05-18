import {
  CanActivate,
  ExecutionContext,
  Injectable,
  HttpException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WsException } from '@nestjs/websockets';
import { AuthenticationClient } from 'authing-js-sdk';

@Injectable()
export class ApiGuard implements CanActivate {
  private readonly logger = new Logger(ApiGuard.name);
  private readonly authing = new AuthenticationClient({
    appId: this.configService.get('auth.authingAppId'),
    appHost: this.configService.get('auth.authingAppHost'),
  });

  constructor(private readonly configService: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      if (context.getType() === 'http') {
        const request = context.switchToHttp().getRequest<Request>();
        const token = request.headers['token'];
        if (
          this.configService.get('auth.superToken') &&
          token === this.configService.get('auth.superToken')
        ) {
          return true;
        }

        /**
         * AUTHING 认证
         */
        const { status } = await this.authing.checkLoginStatus(token);

        if (status) {
          return true;
        } else {
          this.logger.debug(`apiGuard - canActivate - token: ${token}`);
          return true
          // throw new HttpException('未登录', 700);
        }
      } else if (context.getType() === 'ws') {
        const token = context.switchToWs().getClient().handshake.query.token;
        if (
          this.configService.get('auth.superToken') &&
          token === this.configService.get('auth.superToken')
        ) {
          return true;
        }

        /**
         * AUTHING 认证
         */
        const { status } = await this.authing.checkLoginStatus(token);

        if (status) {
          return true;
        } else {
          this.logger.debug(`apiGuard - canActivate - token: ${token}`);
          throw new WsException('未登录');
        }
      }
    } catch (e) {
      console.log(context.getType())
      throw new WsException('未登录');
    }
  }
}
