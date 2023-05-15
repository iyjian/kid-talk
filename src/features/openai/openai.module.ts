import { Module } from '@nestjs/common';
import { OpenaiService } from './openai.service';
import { ChatrepoModule } from '../chatrepo/chatrepo.module';

@Module({
  imports: [ChatrepoModule],
  providers: [OpenaiService],
  exports: [OpenaiService],
})
export class OpenaiModule {}
