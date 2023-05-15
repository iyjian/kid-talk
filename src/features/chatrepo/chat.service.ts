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
    private readonly configService: ConfigService,
    private readonly chatrepoService: ChatrepoService,
    private readonly openaiService: OpenaiService,
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
  async chat(@MessageBody() data: {session: string, role: string, content: string, name?: string}) {
    
    const {session, role, content, name} = data
    
    const messages = JSON.parse(
      JSON.stringify(await this.chatrepoService.findAllBySession(session)),
    );

    const message = {
      session,
      role,
      content: this.formatContent(content),
      name,
    };

    await this.chatrepoService.create(message);

    messages.push(message);

    const result = await this.openaiService.chat(messages);

    await this.chatrepoService.create({
      session,
      role: result.choices[0].message.role,
      content: result.choices[0].message.content,
      promptTokens: result.usage.prompt_tokens,
      completionTokens: result.usage.completion_tokens,
    });

    return result;
  }
}
