import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import crypto from 'crypto';
import moment from 'moment';
import WebSocket from 'ws';

@Injectable()
export class AudioService {
  private readonly appId = this.configService.get('kdxf.appId');
  private readonly apiSecret = this.configService.get('kdxf.apiSecret');
  private readonly apiKey = this.configService.get('kdxf.apiKey');
  private readonly logger = new Logger(AudioService.name);

  constructor(private readonly configService: ConfigService) {
    this.init();
  }

  init() {
    const host = 'iat-api.xfyun.cn';
    const date = moment()
      .subtract(8, 'hours')
      .format('ddd, DD MMM YYYY HH:mm:ss GMT');
    const authorization = this.getAuthorization(host, date);
    this.logger.debug(`authorization: ${authorization} date: ${date}`);
    const ws = new WebSocket(
      `wss://iat-api.xfyun.cn/v2/iat?authorization=${authorization}&date=${encodeURIComponent(
        date,
      )}&host=${host}`,
      {
        perMessageDeflate: false,
      },
    );
  }

  getAuthorization(
    host: string,
    date: string,
    requestLine: string = 'GET /v2/iat HTTP/1.1',
  ): string {
    const message = `host: ${host}\ndate: ${date}\n${requestLine}`;

    const sign = crypto
      .createHmac('sha256', Buffer.from(this.apiSecret, 'utf-8'))
      .update(message)
      .digest('base64');

    this.logger.debug(`${this.apiKey} ${this.apiSecret} sign: ${sign}`);

    const authorizationOrigin = `api_key="${this.apiKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${sign}"`;
    const authorization = Buffer.from(authorizationOrigin).toString('base64');
    return authorization;
  }
}
