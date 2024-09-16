import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class AiqaGuard implements CanActivate {
  logger = new Logger(AiqaGuard.name);

  constructor() {}

  /**
   * canActive在middleware之后执行
   *
   * @param context
   * @returns
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const user = request['locals' as any]
      ? request['locals' as any].user
      : null;

    if (user && user.id && user.member.id) {
      return true;
    } else {
      this.logger.error(
        `canActivate - invalid access - user: ${user?.id} type: ${user?.type}`,
      );
      return false;
    }
  }
}
