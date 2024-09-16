import { Module } from '@nestjs/common';
import { ChatrepoService } from './services/chatrepo.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Chat } from './entities/chatrepo.entity';
import { AudioModule } from '../audio/audio.module';
import { OpenaiModule } from '../openai/openai.module';
import { ChatService } from './services/chat.service';
import { ChatrepoController } from './controllers/chatrepo.controller';
import { User } from './entities/user.entity';
import { PhraseSentence } from './entities/phrase.sentence.entity';
import { Session } from './entities/session.entity';
import { UserService } from './services/user.service';
import { PhraseService } from './services/phrase.service';

@Module({
  imports: [
    SequelizeModule.forFeature([Chat, Session, User, PhraseSentence]),
    AudioModule,
    OpenaiModule,
  ],
  providers: [ChatrepoService, ChatService, UserService, PhraseService],
  exports: [ChatrepoService, UserService],
  controllers: [ChatrepoController],
})
export class ChatrepoModule {}
