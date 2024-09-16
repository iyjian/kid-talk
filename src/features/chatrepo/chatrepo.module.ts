import { Module } from '@nestjs/common'
import { ChatrepoService } from './services/chatrepo.service'
import { SequelizeModule } from '@nestjs/sequelize'
import { Chat } from './entities/chatrepo.entity'
import { AudioModule } from '../audio/audio.module'
import { OpenaiModule } from '../openai/openai.module'
import { ChatService } from './services/chat.service'
import { ChatrepoController } from './controllers/chatrepo.controller'
import { User } from './entities/user.entity'
import { PhraseSentence } from './entities/phrase.sentence.entity'
import { Session } from './entities/session.entity'
import { UserService } from './services/user.service'
import { PhraseService } from './services/phrase.service'
import { PhraseSentenceController } from './controllers/phrase.sentence.controller'
import { PhraseSentenceService } from './services/phrase.sentence.service'

@Module({
  imports: [
    SequelizeModule.forFeature([Chat, Session, User, PhraseSentence]),
    AudioModule,
    OpenaiModule,
  ],
  providers: [
    ChatrepoService,
    ChatService,
    UserService,
    PhraseService,
    PhraseSentenceService,
  ],
  exports: [ChatrepoService, UserService, PhraseSentenceService],
  controllers: [ChatrepoController, PhraseSentenceController],
})
export class ChatrepoModule {}
