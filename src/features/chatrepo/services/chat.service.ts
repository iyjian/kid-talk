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
  path: '/ws',
})

//
export class ChatService implements OnGatewayConnection {
  private readonly logger = new Logger(ChatService.name)

  constructor(
    private readonly chatrepoService: ChatrepoService,
    private readonly openaiService: OpenaiService,
    private readonly authingUserService: AuthingUserService,
  ) {}

  private async getUserIdBySocket(token: string) {
    const user = await this.authingUserService.isLogin(token)
    this.logger.verbose(`getUserIdBySocket - user: ${JSON.stringify(user)}`)
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
    console.log('connected')
  }

  @SubscribeMessage('test')
  test(@ConnectedSocket() client: Socket) {
    // console.log(client.handshake.query.token);
  }

  @SubscribeMessage('init')
  async startNewChat(
    @MessageBody() payload: { token: string, id: number },
  ): Promise<ChatResponse> {
    let currentTime = +new Date()
    this.logger.debug(
      `init - token: ${payload.token} - start - currentTime: ${currentTime}`,
    )
    const userId = await this.getUserIdBySocket(payload.token)

    this.logger.debug(
      `init - token: ${
        payload.token
      } - getUserIdBySocket - currentTime: ${currentTime} duration: ${
        +new Date() - currentTime
      }`,
    )
    currentTime = +new Date()

    const messages = []
    const chatRepo = await this.chatrepoService.init(userId, payload.id)

    this.logger.debug(
      `init - token: ${
        payload.token
      } - chatrepoService.init - currentTime: ${currentTime} duration: ${
        +new Date() - currentTime
      }`,
    )
    currentTime = +new Date()

    messages.push({
      role: chatRepo.role,
      content: this.formatContent(chatRepo.content),
    })

    const result = await this.openaiService.chat(messages)

    this.logger.debug(
      `init - token: ${
        payload.token
      } - openaiService.chat - currentTime: ${currentTime} duration: ${
        +new Date() - currentTime
      }`,
    )
    currentTime = +new Date()

    const response = result.choices[0].message.content

    await this.chatrepoService.create({
      sessionId: chatRepo.sessionId,
      role: result.choices[0].message.role,
      content: response,
      promptTokens: result.usage.prompt_tokens,
      completionTokens: result.usage.completion_tokens,
    })

    this.logger.debug(
      `init - token: ${
        payload.token
      } - chatrepoService.create - currentTime: ${currentTime} duration: ${
        +new Date() - currentTime
      }`,
    )
    currentTime = +new Date()

    const audio = await this.openaiService.createSpeech(
      {
        model: 'tts',
        input: response,
        voice: 'echo',
        response_format: 'mp3',
      },
      {},
    )

    this.logger.debug(
      `init - token: ${
        payload.token
      } - openaiService.createSpeech - currentTime: ${currentTime} duration: ${
        +new Date() - currentTime
      }`,
    )
    currentTime = +new Date()

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
    this.logger.debug(
      `chat - sessionId: ${data.sessionId}, content: ${data.content}, role: ${data.role}, name: ${data.name}`,
    )
    const { sessionId, role = 'user', content, name } = data
    const tmpFile = path.join(__dirname, `./../../../tmp/${uuidv4()}.wav`)
    fs.writeFileSync(tmpFile, Buffer.from(content, 'base64') as any)
    const stream = fs.createReadStream(tmpFile)
    const textContent = await this.openaiService.speech2Text(stream)
    fs.unlinkSync(tmpFile)

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
