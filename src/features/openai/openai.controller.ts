import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common'
import { ReqUserId } from 'src/core/decorator'
import { OpenaiService } from './openai.service'

@Controller('openai')
export class OpenAIController {
  constructor(private readonly openaiService: OpenaiService) {}

  @Post('speech')
  async createSpeech(@Body() body: any) {
    const result = await this.openaiService.createSpeech(body)
    return result.toString('base64')
  }
}
