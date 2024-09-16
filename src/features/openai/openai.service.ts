import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

@Injectable()
export class OpenaiService {
  private readonly logger = new Logger(OpenaiService.name);

  private readonly openai = new OpenAI({
    baseURL: this.configService.get('openai.endpoint'),
    apiKey: this.configService.get('openai.apiKey'),
  });

  constructor(private readonly configService: ConfigService) {
    console.log(this.configService.get('openai.endpoint'));
    console.log(this.configService.get('openai.apiKey'));
  }

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
    messages: Array<ChatCompletionMessageParam>,
  ): Promise<OpenAI.Chat.Completions.ChatCompletion> {
    const result = await this.openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      temperature: 1,
      n: 1,
      stream: false,
      max_tokens: 1000,
      messages,
    });
    return result;
  }

  async ask(quest: string, model: string = 'gpt-4o') {
    return this.openai.chat.completions.create({
      model,
      temperature: 1,
      n: 1,
      stream: false,
      max_tokens: 1000,
      messages: [
        {
          content: quest,
          role: 'user',
        },
      ],
    });
  }

  async createSpeech(
    body: OpenAI.Audio.Speech.SpeechCreateParams,
    options?: OpenAI.RequestOptions,
  ): Promise<Buffer> {
    console.log(`createSpeech - ${JSON.stringify(body)}`);
    const response = await this.openai.audio.speech.create(body, options);
    return Buffer.from(await response.arrayBuffer());
  }
}
