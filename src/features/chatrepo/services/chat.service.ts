import { Injectable, Logger, UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayConnection,
  ConnectedSocket,
} from '@nestjs/websockets';
import { ChatrepoService } from './chatrepo.service';
import { OpenaiService } from './../../openai/openai.service';
import { BaiduSpeechService } from './../../audio/baidu.speech.service';
import { ApiGuard } from './../../../core/api.guard';
import { AuthenticationClient } from 'authing-js-sdk';
import { ConfigService } from '@nestjs/config';
import { UserService } from './user.service';

type ChatResponse = {
  sessionId: number;
  text: string;
  audio?: string;
};

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})

//
export class ChatService implements OnGatewayConnection {
  private readonly logger = new Logger(ChatService.name);

  private readonly socketUsers = {};

  private readonly authing = new AuthenticationClient({
    appId: this.configService.get('auth.authingAppId'),
    appHost: this.configService.get('auth.authingAppHost'),
  });

  constructor(
    private readonly chatrepoService: ChatrepoService,
    private readonly openaiService: OpenaiService,
    private readonly baiduSpeechService: BaiduSpeechService,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {}

  private async getUserId(client: Socket) {
    const token = client.handshake.query.token as string;
    const userInfo = (await this.authing.checkLoginStatus(token)) as {
      code: number;
      message: string;
      status: boolean;
      exp: number;
      iat: number;
      data: {
        id: string;
        userPoolId: string;
      };
    };
    const user = await this.userService.findOneByUid(userInfo.data.id);
    return user.id;
  }

  private formatContent(str: string) {
    return str
      .split(/\n/)
      .map((line) => line.trim())
      .join('\n');
  }

  /**
   *
   *
   * @param client
   */
  @UseGuards(ApiGuard)
  handleConnection(client: Socket) {
    this.logger.debug(`socketio client connected: ${client.id}`);
    this.socketUsers[client.id] = {
      client,
    };
  }

  // async handleClientEvents(@MessageBody() data: string) {
  //   this.logger.debug(`handleClientEvents - text2speech - text: ${data}`);
  // }

  @UseGuards(ApiGuard)
  @SubscribeMessage('test')
  test(@ConnectedSocket() client: Socket) {
    // console.log(client.handshake.query.token);
  }

  @SubscribeMessage('init')
  async startNewChat(
    @MessageBody() data: { mode: string },
    @ConnectedSocket() client: Socket,
  ): Promise<ChatResponse> {
    const userId = await this.getUserId(client);
    const messages = [];
    const chatRepo = await this.chatrepoService.init(userId);

    messages.push({
      role: chatRepo.role,
      content: this.formatContent(chatRepo.content),
    });

    const result = await this.openaiService.chat(messages);

    const response = result.choices[0].message.content;

    await this.chatrepoService.create({
      sessionId: chatRepo.sessionId,
      role: result.choices[0].message.role,
      content: response,
      promptTokens: result.usage.prompt_tokens,
      completionTokens: result.usage.completion_tokens,
    });

    const audio = await this.baiduSpeechService.text2Speech(response);

    return {
      sessionId: chatRepo.sessionId,
      text: result.choices[0].message.content,
      audio: 'data:audio/mp3;base64,' + audio.toString('base64'),
    };
  }

  @SubscribeMessage('chat')
  async chat(
    @MessageBody()
    data: {
      sessionId: number;
      content: string | Buffer;
      role?: string;
      name?: string;
    },
  ): Promise<ChatResponse> {
    let { sessionId, role = 'user', content, name } = data;

    if (typeof content !== 'string') {
      const speech2TextResult = await this.baiduSpeechService.speech2Text(
        content,
      );
      content = speech2TextResult.result[0];
    }

    const messages = JSON.parse(
      JSON.stringify(await this.chatrepoService.findAllBySession(sessionId)),
    );
    // const messages = [];

    await this.chatrepoService.create({
      sessionId,
      role,
      content: this.formatContent(content),
      name,
    });

    messages.push({ role, content: this.formatContent(content), name });

    const result = await this.openaiService.chat(messages);

    const response = result.choices[0].message.content;

    await this.chatrepoService.create({
      sessionId,
      role: result.choices[0].message.role,
      content: response,
      promptTokens: result.usage.prompt_tokens,
      completionTokens: result.usage.completion_tokens,
    });

    const audio = await this.baiduSpeechService.text2Speech(response);
    return {
      sessionId,
      text: result.choices[0].message.content,
      audio: 'data:audio/mp3;base64,' + audio.toString('base64'),
    };
  }
}
