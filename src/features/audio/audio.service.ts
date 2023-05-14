import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Server, Socket } from 'socket.io';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayConnection,
  ConnectedSocket,
} from '@nestjs/websockets';
import baiduAIP from 'baidu-aip-sdk';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import { Readable } from 'stream';
import path from 'path';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
//
export class AudioService implements OnGatewayConnection {
  private readonly logger = new Logger(AudioService.name);
  private readonly baiduAIPAccessKey =
    this.configService.get('baidu.accessKey');
  private readonly baiduAIPAccessSecret =
    this.configService.get('baidu.accessSecret');
  private readonly baiduAIPAppId = this.configService.get('baidu.accessKey');

  private readonly client = new baiduAIP.speech(
    this.baiduAIPAppId,
    this.baiduAIPAccessKey,
    this.baiduAIPAccessSecret,
  );

  private readonly socketUsers = {};

  constructor(private readonly configService: ConfigService) {}

  /**
   * 为每个客户端新建两个text2speech speech2text的连接
   *
   * @param client
   */
  handleConnection(client: Socket) {
    this.logger.debug(`socketio client connected: ${client.id}`);
    this.socketUsers[client.id] = {
      client,
    };
  }

  @SubscribeMessage('text2speech')
  async handleClientEvents(@MessageBody() data: string) {
    this.logger.debug(`handleClientEvents - text2speech - text: ${data}`);
    // 调用调试工具
    // https://console.bce.baidu.com/tools/?_=1669807341890#/api?product=AI&project=%E8%AF%AD%E9%9F%B3%E6%8A%80%E6%9C%AF&parent=%E8%AF%AD%E9%9F%B3%E5%90%88%E6%88%90&api=text2audio&method=post
    const result = await this.client.text2audio(data, {
      per: 5,
      spd: 6,
    });
    console.log(result.data.toString('base64'));
    return result.data;
  }

  @SubscribeMessage('speech2text')
  async handleSpeech2Text(@MessageBody() data: Buffer) {
    const transformedFile = path.join(
      __dirname,
      `./tmp/${Math.round(Math.random() * 10000000)}.wav`,
    );

    const readable = new Readable();
    readable._read = () => {}; // _read is required but you can noop it
    readable.push(data);
    readable.push(null);

    const stream = fs.createWriteStream(transformedFile);

    const transformed = await new Promise((resolve, reject) => {
      ffmpeg(readable)
        .format('wav')
        .output(stream, { end: true })
        .outputOptions(['-ar 1', '-ar 16000', '-vn'])
        .on('end', function () {
          console.log('Finished processing');
          resolve(stream);
        })
        .run();
    });

    const result = await this.client.recognize(
      fs.readFileSync(transformedFile),
      'wav',
      16000,
      {
        dev_pid: 1737,
      },
    );
    console.log(result);
    return result;
  }
}
