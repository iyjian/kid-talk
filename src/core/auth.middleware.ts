import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NestMiddleware,
} from '@nestjs/common'
import { Response, Request, NextFunction } from 'express'
import { AuthenticationClient } from 'authing-js-sdk'
import ConfigService from './../config'
import { UserService } from './../features/chatrepo/services/user.service'

const configService = ConfigService()

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private readonly logger = new Logger(AuthMiddleware.name)
  private readonly authing = new AuthenticationClient({
    // appId: configService.auth.authingAppId,
    // appHost: configService.auth.authingAppHost,
    appId: '',
    appHost: '',
  })
  constructor(private readonly userService: UserService) {}

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    const token = req.headers['token'] as string
    // this.logger.debug(`token: ${token}`);
    const userInfo = (await this.authing.checkLoginStatus(token)) as {
      code: number
      message: string
      status: boolean
      exp: number
      iat: number
      data: {
        id: string
        userPoolId: string
      }
    }

    this.logger.debug(userInfo)

    if (!userInfo || !userInfo.status) {
      this.logger.debug(`auth failed`)
      throw new HttpException('无权限', HttpStatus.UNAUTHORIZED)
    }

    const user = await this.userService.findOneByUid(userInfo.data.id)

    if (!user || !user.isEnable) {
      if (!user) {
        await this.userService.create(userInfo.data.id)
      }
      throw new HttpException('无权限', HttpStatus.UNAUTHORIZED)
    }

    req['locals'] = {
      user: { id: user.id },
    }

    next()
  }
}
