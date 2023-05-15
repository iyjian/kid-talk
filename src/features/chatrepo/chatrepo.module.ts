import { Module } from '@nestjs/common';
import { ChatrepoService } from './chatrepo.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Chat } from './chatrepo.entity';
import { AudioModule } from '../audio/audio.module';
import { OpenaiModule } from '../openai/openai.module';
import { ChatService } from './chat.service';
import { ChatrepoController } from './chatrepo.controller';

@Module({
  imports: [SequelizeModule.forFeature([Chat]), AudioModule, OpenaiModule],
  providers: [ChatrepoService, ChatService],
  exports: [ChatrepoService],
  controllers: [ChatrepoController],
})
export class ChatrepoModule {}
