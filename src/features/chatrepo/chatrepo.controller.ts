import { Controller, Get, Param, Query } from '@nestjs/common';
import { ChatrepoService } from './chatrepo.service';

@Controller('chatrepo')
export class ChatrepoController {
  constructor(private readonly chatrepoService: ChatrepoService) {}

  @Get('session/:sessionId')
  findAllBySession(
    @Param('sessionId') sessionId: string,
    @Query('maxId') maxId: string,
  ) {
    return this.chatrepoService.findAllBySession(+sessionId, +maxId);
  }
}
