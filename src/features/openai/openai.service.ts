import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ChatCompletionRequestMessage,
  Configuration,
  CreateChatCompletionResponse,
  OpenAIApi,
} from 'openai';
import tunnel from 'tunnel';

@Injectable()
export class OpenaiService {
  private readonly logger = new Logger(OpenaiService.name);
  private readonly configuration = new Configuration({
    apiKey: this.configService.get('openai.apiKey'),
  });
  private readonly openai = new OpenAIApi(this.configuration);
  private readonly agent = tunnel.httpsOverHttp({
    proxy: {
      host: this.configService.get('proxy.host'),
      port: this.configService.get('proxy.port'),
    },
  });
  constructor(private readonly configService: ConfigService) {}

  /**
    {
      "id": "chatcmpl-123",
      "object": "chat.completion",
      "created": 1677652288,
      "choices": [{
        "index": 0,
        "message": {
          "role": "assistant",
          "content": "\n\nHello there, how may I assist you today?",
        },
        "finish_reason": "stop"
      }],
      "usage": {
        "prompt_tokens": 9,
        "completion_tokens": 12,
        "total_tokens": 21
      }
    }
   */
  async chat(
    messages: ChatCompletionRequestMessage[],
  ): Promise<CreateChatCompletionResponse> {
    this.logger.debug(`chat - messages: ${JSON.stringify(messages)}`);
    const result = await this.openai.createChatCompletion(
      {
        model: 'gpt-3.5-turbo',
        temperature: 1,
        n: 1,
        stream: false,
        max_tokens: 1000,
        messages,
      },
      { httpsAgent: this.agent },
    );

    return result.data;
  }
}
