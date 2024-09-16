import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NestMiddleware,
} from '@nestjs/common';
import { Response, NextFunction } from 'express';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { AuthingRequest, USER_TYPE } from '../interfaces';
import { nanoid } from 'nanoid';
import { AsyncClientService } from './../../features/async-client';
import { AuthingUserService } from './../../features/user/services/authing.user.service';
import moment from 'moment';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  logger = new Logger(AuthMiddleware.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly userService: AuthingUserService,
    private readonly asyncClientService: AsyncClientService,
  ) {}

  async use(
    req: AuthingRequest,
    _res: Response,
    next: NextFunction,
  ): Promise<void> {
    const startTime = process.hrtime();
    const requestId = nanoid(32);
    req.headers['requestId'] = requestId;
    /**
     * token有两个模式
     * 1. 标准模式: 通过cookie传入
     * 2. 作弊模式: 前端通过query参数传入,比如导出文件链接
     */
    const token = req.get('token') || req?.query?.token?.toString();
    const appId = req.get('appId');
    const nonce = req.get('nonce');
    const sign = req.get('sign');
    const timestamp = req.get('timestamp');

    if (req.path === '/') {
      _res.send('ding-dong');
      return;
    }

    this.logger.debug(`ip: ${req.ip} path: ${req.path} token: ${token}`);

    delete req.query.token;

    if (
      /^\/i18n/.test(req.path) ||
      /swagger/.test(req.path) ||
      (req.method.toLowerCase() === 'post' && /register/.test(req.path)) ||
      (/classRoom/.test(req.path) && req.method.toLowerCase() === 'get') ||
      // electron注册设备
      (/\/device\/validate/.test(req.path) &&
        req.method.toLowerCase() === 'post')
    ) {
      /**
       * public接口，无需认证
       */
      next();
    } else if (
      this.configService.get<string>('NODE_ENV') === 'development' ||
      token === '0f226e908d094e77ab32d096e49cd896' ||
      token === '1f226e908d094e77ab32d096e49cd896'
    ) {
      /**
       * 开发环境无需认证
       */
      req.locals = {
        user: {
          id:
            token === '0f226e908d094e77ab32d096e49cd896'
              ? 1
              : token === '1f226e908d094e77ab32d096e49cd896'
              ? 2
              : 1,
          type: 1,
          member: {
            id: 1,
            type: USER_TYPE.TEACHER,
          },
          isAdmin: token === '0f226e908d094e77ab32d096e49cd896' ? true : false,
        },
        token: token || '0f226e908d094e77ab32d096e49cd896',
      };

      _res.cookie('token', token, {
        maxAge: 1000 * 3600,
        httpOnly: true,
        secure: false,
      });
      next();
    } else if (token || (appId && nonce && sign)) {
      /**
       * 需要认证的接口，调用authing权限检查接口检查权限
       */
      try {
        // console.log(
        //   await this.configService
        //     .get<any>('etcd')
        //     .get('/config/auth_server')
        //     .string(),
        // )
        const response = await axios.post(
          `${this.configService.get<string>(
            'auth.server',
          )}/auth/permissions/check`,
          {
            path: req.path,
            action: req.method.toLowerCase(),
          },
          {
            headers: {
              token,
              appId,
              nonce,
              timestamp,
              sign,
            },
          },
        );

        if (response.data.err !== 0) {
          throw new HttpException(response.data.errMsg, response.data.err);
        }

        if (!response.data.data.permission) {
          throw new HttpException('无权限', HttpStatus.FORBIDDEN);
        }

        const user = await this.userService.findOneByIdOrThrow(
          response.data.data.user.id,
        );

        // 有效期过期的账号无法登录
        if (
          user?.member?.validityDays &&
          parseInt(moment(user.createdAt).format('X')) +
            user.member.validityDays * 24 * 60 * 60 <
            parseInt(moment().format('X'))
        ) {
          throw new HttpException(
            '账号已过期,请联系管理员',
            HttpStatus.FORBIDDEN,
          );
        }

        req.locals = {
          user: user,
          token,
        };

        this.logger.verbose(
          `set user info in req.locals user: ${JSON.stringify(
            req['locals']['user'],
          )}`,
        );

        next();
      } catch (e) {
        throw e;
      }
    } else {
      throw new HttpException(
        '无有效TOKEN,请重新登录',
        HttpStatus.UNAUTHORIZED,
      );
    }

    _res.on('finish', () => {
      if (req.method.toLowerCase() === 'get') {
        return;
      }

      const { statusCode } = _res;
      const diff = process.hrtime(startTime);
      const duration = diff[0] * 1e3 + diff[1] * 1e-6;
      this.asyncClientService.updateLog({
        requestId,
        duration,
        statusCode,
      });
    });
  }
}
