import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common'
import { ChatrepoService } from '../services/chatrepo.service'
import { ReqUserId } from 'src/core/decorator'
import { PhraseService } from '../services/phrase.service'

@Controller('chatrepo')
export class ChatrepoController {
  constructor(
    private readonly chatrepoService: ChatrepoService,
    private readonly phraseService: PhraseService,
  ) {}

  @Post('phrase/sentence')
  createSentencesWithSpeech(@Body() body: any) {
    return this.phraseService.createSentencesWithSpeech(body)
  }

  @Get('session/latest')
  findLatestSession(@ReqUserId('userId') userId: number) {
    return this.chatrepoService.findLatestSession(userId)
  }

  @Get('session/:sessionId')
  findAllBySession(
    @Param('sessionId') sessionId: string,
    @Query('maxId') maxId: string,
  ) {
    return this.chatrepoService.findAllBySessionId(+sessionId, +maxId)
  }
}
