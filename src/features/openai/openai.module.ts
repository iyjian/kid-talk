import { Module } from '@nestjs/common'
import { OpenaiService } from './openai.service'
import { OpenAIController } from './openai.controller'

@Module({
  controllers: [OpenAIController],
  providers: [OpenaiService],
  exports: [OpenaiService],
})
export class OpenaiModule {}
