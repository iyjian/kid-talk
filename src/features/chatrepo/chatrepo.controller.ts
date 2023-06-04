import { Controller, Get, Param, Query } from '@nestjs/common';
import { ChatrepoService } from './chatrepo.service';
import { ReqUserId } from 'src/core/decorator';

@Controller('chatrepo')
export class ChatrepoController {
  constructor(private readonly chatrepoService: ChatrepoService) {}

  @Get('session/latest')
  findLatestSession(@ReqUserId('userId') userId: number) {
    return this.chatrepoService.findLatestSession(userId);
  }

  @Get('session/:sessionId')
  findAllBySession(
    @Param('sessionId') sessionId: string,
    @Query('maxId') maxId: string,
  ) {
    return this.chatrepoService.findAllBySession(+sessionId, +maxId);
  }
}
