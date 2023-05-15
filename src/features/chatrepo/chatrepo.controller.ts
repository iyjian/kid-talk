import { Controller, Get, Param, Query } from '@nestjs/common';
import { ChatrepoService } from './chatrepo.service';

@Controller('chatrepo')
export class ChatrepoController {
  constructor(private readonly chatrepoService: ChatrepoService) {}

  @Get('session/:session')
  findAllBySession(
    @Param('session') session: string,
    @Query('maxId') maxId: string,
  ) {
    return this.chatrepoService.findAllBySession(session, +maxId);
  }
}
