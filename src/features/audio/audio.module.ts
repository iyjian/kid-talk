import { Module } from '@nestjs/common'
import { BaiduSpeechService } from './baidu.speech.service'

@Module({
  providers: [BaiduSpeechService],
  exports: [BaiduSpeechService],
})
export class AudioModule {}
