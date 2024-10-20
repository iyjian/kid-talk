import { Injectable, Logger, UseGuards } from '@nestjs/common'
import { Server, Socket } from 'socket.io'
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayConnection,
  ConnectedSocket,
} from '@nestjs/websockets'
import { ChatrepoService } from './chatrepo.service'
import { OpenaiService } from './../../openai/openai.service'
import { BaiduSpeechService } from './../../audio/baidu.speech.service'
import { ApiGuard } from './../../../core/api.guard'
import { AuthenticationClient } from 'authing-js-sdk'
import { ConfigService } from '@nestjs/config'
import { AuthingUserService } from './../../user/authing.user.service'
import path from 'path'
import fs from 'fs'
import { v4 as uuidv4 } from 'uuid'

type ChatResponse = {
  command: string
  sessionId: number
  content: string
  audio?: string
  role: string
  originContent?: string
}

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
  },
  transports: ['websocket'],
  path: '/ws'
})

//
export class ChatService implements OnGatewayConnection {
  private readonly logger = new Logger(ChatService.name)

  constructor(
    private readonly chatrepoService: ChatrepoService,
    private readonly openaiService: OpenaiService,
    // private readonly baiduSpeechService: BaiduSpeechService,
    // private readonly configService: ConfigService,
    private readonly authingUserService: AuthingUserService,
  ) {
  }

  private async getUserIdBySocket(token: string) {
    // const userInfo = (await this.authing.checkLoginStatus(token)) as {
    //   code: number
    //   message: string
    //   status: boolean
    //   exp: number
    //   iat: number
    //   data: {
    //     id: string
    //     userPoolId: string
    //   }
    // }
    const user = await this.authingUserService.isLogin(token)
    // const user = await this.authingUserService.findOneByUid(userInfo.data.id)
    return user.id
  }

  private formatContent(str: string) {
    return str
      .split(/\n/)
      .map((line) => line.trim())
      .join('\n')
  }

  /**
   *
   *
   * @param client
   */
  // @UseGuards(ApiGuard)
  handleConnection(client: Socket, req: any) {
    // const token = client.handshake.query.token as string
    // this.logger.debug(`socketio client connected - token: ${token}`)
    // console.log(client)
    // console.log(req.url)
    // // console.log(client.request)
    // this.socketUsers[client.id] = {
    //   client,
    // }
    console.log('connected')
  }

  // async handleClientEvents(@MessageBody() data: string) {
  //   this.logger.debug(`handleClientEvents - text2speech - text: ${data}`);
  // }

  // @UseGuards(ApiGuard)
  @SubscribeMessage('test')
  test(@ConnectedSocket() client: Socket) {
    // console.log(client.handshake.query.token);
  }

  @SubscribeMessage('init')
  async startNewChat(
    @MessageBody() payload: { token: string },
  ): Promise<ChatResponse> {
    this.logger.debug(`init - token: ${payload.token}`)
    const userId = await this.getUserIdBySocket(payload.token)
    const messages = []
    const chatRepo = await this.chatrepoService.init(userId)

    messages.push({
      role: chatRepo.role,
      content: this.formatContent(chatRepo.content),
    })

    const result = await this.openaiService.chat(messages)

    const response = result.choices[0].message.content

    await this.chatrepoService.create({
      sessionId: chatRepo.sessionId,
      role: result.choices[0].message.role,
      content: response,
      promptTokens: result.usage.prompt_tokens,
      completionTokens: result.usage.completion_tokens,
    })

    // const audio = await this.baiduSpeechService.text2Speech(response)
    const audio = await this.openaiService.createSpeech(
      {
        model: 'tts',
        input: response,
        voice: 'echo',
        response_format: 'mp3',
      },
      {},
    )

    return {
      command: 'init',
      sessionId: chatRepo.sessionId,
      role: result.choices[0].message.role,
      content: result.choices[0].message.content,
      audio: 'data:audio/mp3;base64,' + audio.toString('base64'),
    }
  }

  @SubscribeMessage('chat')
  async chat(
    @MessageBody()
    data: {
      sessionId: number
      content: string
      role?: string
      name?: string
    },
  ): Promise<ChatResponse> {
    this.logger.debug(`chat - sessionId: ${data.sessionId}, content: ${data.content}, role: ${data.role}, name: ${data.name}`)
    const { sessionId, role = 'user', content, name } = data
    const tmpFile = path.join(__dirname, `./../../../tmp/${uuidv4()}.wav`)
    fs.writeFileSync(tmpFile, Buffer.from(content, 'base64') as any)
    const stream = fs.createReadStream(tmpFile)
    const textContent = await this.openaiService.speech2Text(stream)
    fs.unlinkSync(tmpFile)
    // const speech2TextResult = await this.baiduSpeechService.speech2Text(
    //   content,
    // )
    // content = speech2TextResult.result[0]
    console.log(content)

    const messages = JSON.parse(
      JSON.stringify(await this.chatrepoService.findAllBySessionId(sessionId)),
    )

    await this.chatrepoService.create({
      sessionId,
      role,
      content: this.formatContent(textContent),
      name,
    })

    messages.push({ role, content: this.formatContent(textContent), name })

    const result = await this.openaiService.chat(messages)

    const response = result.choices[0].message.content

    await this.chatrepoService.create({
      sessionId,
      role: result.choices[0].message.role,
      content: response,
      promptTokens: result.usage.prompt_tokens,
      completionTokens: result.usage.completion_tokens,
    })

    // const audio = await this.baiduSpeechService.text2Speech(response)
    const audio = await this.openaiService.createSpeech(
      {
        model: 'tts',
        input: response,
        voice: 'echo',
        response_format: 'mp3',
      },
      {},
    )
    return {
      command: 'chat',
      sessionId,
      role: result.choices[0].message.role,
      originContent: textContent,
      content: result.choices[0].message.content,
      audio: 'data:audio/mp3;base64,' + audio.toString('base64'),
    }
  }
}
