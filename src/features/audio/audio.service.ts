import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import crypto from 'crypto';
import moment from 'moment';
import WebSocket from 'ws';
import Speaker from 'speaker';
import {Readable} from 'stream'

type Text2SpeechResponse = {
  "code": number,
  "message": string,
  "sid": string,
  "data":{
      "audio":string,
      "ced":string,
      "status":number
  }
}


@Injectable()
export class AudioService {
  private readonly appId = this.configService.get('kdxf.appId');
  private readonly apiSecret = this.configService.get('kdxf.apiSecret');
  private readonly apiKey = this.configService.get('kdxf.apiKey');
  private readonly logger = new Logger(AudioService.name);
  private ws: WebSocket;
  private text2speechClient: WebSocket;
  private speaker = new Speaker({
    channels: 1,          // 1 channel
    bitDepth: 16,         // 每个样本占16个比特(2个字节)
    sampleRate: 16000     // 每秒钟16000个采样(一秒钟32kb数据量)
  });

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
  handleText2SpeechResult(payload: Text2SpeechResponse) {
    // https://www.xfyun.cn/doc/tts/online_tts/API.html#%E6%8E%A5%E5%8F%A3%E8%B0%83%E7%94%A8%E6%B5%81%E7%A8%8B
    // 服务端可能返回data为空的帧，并且错误码为0，这种帧客户端可以直接忽略，不解析(搜索上面链接的注意事项)
    if (!payload.data) return
    Readable.from(Buffer.from(payload.data.audio, 'base64')).pipe(this.speaker)
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
        auf: 'audio/L16;rate=16000',
        vcn,
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
