import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Server, Socket } from 'socket.io';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { ChatrepoService } from './chatrepo.service';
import { OpenaiService } from '../openai/openai.service';
import { BaiduSpeechService } from '../audio/baidu.speech.service';

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

  constructor(
    private readonly chatrepoService: ChatrepoService,
    private readonly openaiService: OpenaiService,
    private readonly baiduSpeechService: BaiduSpeechService,
  ) {}

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
  handleConnection(client: Socket) {
    this.logger.debug(`socketio client connected: ${client.id}`);
    this.socketUsers[client.id] = {
      client,
    };
  }

  // async handleClientEvents(@MessageBody() data: string) {
  //   this.logger.debug(`handleClientEvents - text2speech - text: ${data}`);
  // }

  @SubscribeMessage('chat')
  async chat(
    @MessageBody()
    data: {
      session: string;
      content: string | Buffer;
      role?: string;
      name?: string;
    },
  ): Promise<{
    text: string;
    audio?: Buffer;
  }> {
    let { session, role = 'user', content, name } = data;

    if (typeof content !== 'string') {
      content = '';
    }

    const messages = JSON.parse(
      JSON.stringify(await this.chatrepoService.findAllBySession(session)),
    );

    // const message = {
    //   session,
    //   role,
    //   content: this.formatContent(content),
    //   name,
    // };

    await this.chatrepoService.create({
      session,
      role,
      content: this.formatContent(content),
      name,
    });

    messages.push({ role, content: this.formatContent(content), name });

    const result = await this.openaiService.chat(messages);

    const response = result.choices[0].message.content;

    await this.chatrepoService.create({
      session,
      role: result.choices[0].message.role,
      content: response,
      promptTokens: result.usage.prompt_tokens,
      completionTokens: result.usage.completion_tokens,
    });

    return {
      text: result.choices[0].message.content,
      audio: await this.baiduSpeechService.text2Speech(response),
    };
  }
}
