import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter'
import crypto from 'crypto'
import moment from 'moment'
import WebSocket from 'ws'
import { Server, Socket } from 'socket.io'
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
  OnGatewayConnection,
  ConnectedSocket,
} from '@nestjs/websockets'
// import baiduAIP from 'baidu-aip-sdk'

type Text2SpeechResponse = {
  code: number
  message: string
  sid: string
  data: {
    audio: string
    ced: string
    status: number
  }
}

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
//
export class KDXFAudioService implements OnGatewayConnection {
  private readonly appId = this.configService.get('kdxf.appId')
  private readonly apiSecret = this.configService.get('kdxf.apiSecret')
  private readonly apiKey = this.configService.get('kdxf.apiKey')
  private readonly logger = new Logger(KDXFAudioService.name)

  private readonly socketUsers = {}

  constructor(
    private readonly configService: ConfigService,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * 为每个客户端新建两个text2speech speech2text的连接
   *
   * @param client
   */
  handleConnection(client: Socket) {
    this.logger.debug(`socketio client connected: ${client.id}`)
    this.socketUsers[client.id] = {
      client,
    }
  }

  private registerKDXFClientForSocketIOClient(
    clientId: string,
    type: 'text2speechClient' | 'speech2TextClient',
    cb: (payload: any) => void,
  ) {
    const socketIOClient = this.socketUsers[clientId]
    if (socketIOClient[type]) {
      socketIOClient[type].close()
    }
    socketIOClient[type] = this.initClient(
      type === 'text2speechClient' ? '/v2/tts' : '/v2/iat',
    )
    socketIOClient[type].onopen = () => {
      socketIOClient.client.emit('ready', { [type]: true })
      cb(socketIOClient[type])
    }
    socketIOClient[type].onmessage = (event: any) => {
      console.log(
        `registerKDXFClientForSocketIOClient - ${type} - onMessage - `,
      )
      this.eventEmitter.emit(
        'event.audio.text2speech',
        clientId,
        JSON.parse(event.data.toString()),
      )
    }
  }

  /**
   *
   * @param path
   * @returns
   */
  initClient(path: string) {
    const host = 'iat-api.xfyun.cn'
    const date = moment()
      .subtract(8, 'hours')
      .format('ddd, DD MMM YYYY HH:mm:ss GMT')
    const authorization = this.getAuthorization(host, date, path)
    this.logger.debug(`authorization: ${authorization} date: ${date}`)

    return new WebSocket(
      `wss://${host}${path}?authorization=${authorization}&date=${encodeURIComponent(
        date,
      )}&host=${host}`,
      {
        perMessageDeflate: false,
      },
    )
  }

  @OnEvent('event.audio.text2speech')
  handleText2SpeechResult(clientId: string, payload: Text2SpeechResponse) {
    // https://www.xfyun.cn/doc/tts/online_tts/API.html#%E6%8E%A5%E5%8F%A3%E8%B0%83%E7%94%A8%E6%B5%81%E7%A8%8B
    // 服务端可能返回data为空的帧，并且错误码为0，这种帧客户端可以直接忽略，不解析(搜索上面链接的注意事项)
    if (!payload.data) return
    this.logger.verbose(
      `event.audio.text2speech - clientId: ${clientId} payload: ${payload}`,
    )
    // Readable.from(Buffer.from(payload.data.audio, 'base64'));
    this.socketUsers[clientId].client.emit('audio', payload.data.audio)
  }

  public getAuthorization(
    host: string,
    date: string,
    path: string = '/v2/iat',
  ): string {
    const message = `host: ${host}\ndate: ${date}\nGET ${path} HTTP/1.1`

    const sign = crypto
      .createHmac('sha256', Buffer.from(this.apiSecret, 'utf-8'))
      .update(message)
      .digest('base64')

    this.logger.debug(`${this.apiKey} ${this.apiSecret} sign: ${sign}`)

    const authorizationOrigin = `api_key="${this.apiKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${sign}"`

    const authorization = Buffer.from(authorizationOrigin).toString('base64')

    return authorization
  }

  // @SubscribeMessage('text2speech')
  // handleClientEvents(
  //   @ConnectedSocket() client: Socket,
  //   @MessageBody() data: { text: string },
  // ) {
  //   this.logger.debug(`handleClientEvents - text2speech - text: ${data.text}`)
  //   this.text2speech(client.id, data.text)
  // }

  private text2speech(
    clientId: string,
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
        aue: 'lame',
        sfl: 1,
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
    }
    this.registerKDXFClientForSocketIOClient(
      clientId,
      'text2speechClient',
      (client) => {
        client.send(JSON.stringify(payload))
      },
    )
  }
}
