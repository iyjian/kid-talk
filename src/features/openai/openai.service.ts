import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Configuration, OpenAIApi } from 'openai';
import tunnel from 'tunnel';

@Injectable()
export class OpenaiService {
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
  async chat(): Promise<any> {
    const result = await this.openai.createChatCompletion(
      {
        model: 'gpt-3.5-turbo',
        temperature: 1,
        n: 1,
        stream: false,
        max_tokens: 1000,
        messages: [
          {
            role: 'system',
            content: `You are an English teacher and I am a Chinese 4th grade student with only 4000 vocabulary. 
1. You practice English with me
2. you ask me questions as actively as possible
3. don't be cold, and if my answer has grammatical or expression errors, you need to correct my grammatical or expression errors in your next answer. 
please say OK, and start if you understand.`,
          },
        ],
      },
      { httpsAgent: this.agent },
    );
    return result.data;
  }
}
