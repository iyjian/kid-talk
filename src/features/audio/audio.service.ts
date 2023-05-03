import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import crypto from 'crypto';
import moment from 'moment';
import WebSocket from 'ws';

@Injectable()
export class AudioService {
  private readonly appId = this.configService.get('kdxf.appId');
  private readonly apiSecret = this.configService.get('kdxf.apiSecret');
  private readonly apiKey = this.configService.get('kdxf.apiKey');
  private readonly logger = new Logger(AudioService.name);
  private ws: WebSocket;
  private text2speechClient: WebSocket;

  constructor(
    private readonly configService: ConfigService,
    private eventEmitter: EventEmitter2,
  ) {
    this.init();
  }

  init() {
    const host = 'iat-api.xfyun.cn';
    const date = moment()
      .subtract(8, 'hours')
      .format('ddd, DD MMM YYYY HH:mm:ss GMT');
    const authorization = this.getAuthorization(host, date, '/v2/tts');
    this.logger.debug(`authorization: ${authorization} date: ${date}`);

    this.text2speechClient = new WebSocket(
      `wss://iat-api.xfyun.cn/v2/tts?authorization=${authorization}&date=${encodeURIComponent(
        date,
      )}&host=${host}`,
      {
        perMessageDeflate: false,
      },
    );

    // this.ws = new WebSocket(
    //   `wss://iat-api.xfyun.cn/v2/iat?authorization=${authorization}&date=${encodeURIComponent(
    //     date,
    //   )}&host=${host}`,
    //   {
    //     perMessageDeflate: false,
    //   },
    // );

    this.text2speechClient.onmessage = (event) => {
      this.eventEmitter.emit(
        'event.audio.text2speech',
        JSON.parse(event.data.toString()),
      );
    };

    this.text2speechClient.onopen = () => {
      this.logger.debug('ws connected');
      this.text2speech('hello world');
    };
  }

  @OnEvent('event.audio.text2speech')
  handleOrderCreatedEvent(payload: any) {
    console.log(payload);
  }

  getAuthorization(
    host: string,
    date: string,
    path: string = '/v2/iat',
  ): string {
    const message = `host: ${host}\ndate: ${date}\nGET ${path} HTTP/1.1`;

    const sign = crypto
      .createHmac('sha256', Buffer.from(this.apiSecret, 'utf-8'))
      .update(message)
      .digest('base64');

    this.logger.debug(`${this.apiKey} ${this.apiSecret} sign: ${sign}`);

    const authorizationOrigin = `api_key="${this.apiKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${sign}"`;

    const authorization = Buffer.from(authorizationOrigin).toString('base64');

    return authorization;
  }

  text2speech(
    text: string,
    speed = 50,
    volume = 50,
    pitch = 50,
    vcn = 'lindsay',
  ) {
    const payload = {
      common: {
        app_id: this.appId,
      },
      business: {
        aue: 'raw',
        vcn: 'xiaoyan',
        pitch,
        speed,
        volume,
      },
      data: {
        status: 2,
        text: Buffer.from(text).toString('base64'),
      },
    };
    this.text2speechClient.send(JSON.stringify(payload));
  }
}
