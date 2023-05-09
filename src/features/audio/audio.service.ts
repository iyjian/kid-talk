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
  async handleClientEvents(@MessageBody() text: string) {
    this.logger.debug(`handleClientEvents - text2speech - text: ${text}`);
    // 调用调试工具
    // https://console.bce.baidu.com/tools/?_=1669807341890#/api?product=AI&project=%E8%AF%AD%E9%9F%B3%E6%8A%80%E6%9C%AF&parent=%E8%AF%AD%E9%9F%B3%E5%90%88%E6%88%90&api=text2audio&method=post
    const result = await this.client.text2audio(text, {
      per: 5,
      spd: 6,
    });
    console.log(result.data.toString('base64'));
    return result.data;
  }

  @SubscribeMessage('speech2text')
  async handleSpeech2Text(@MessageBody() data: Buffer) {
    console.log(data);
  }
}
