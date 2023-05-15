import { Module } from '@nestjs/common';
import { ChatrepoService } from './chatrepo.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Chat } from './chatrepo.entity';

@Module({
  imports: [SequelizeModule.forFeature([Chat])],
  providers: [ChatrepoService],
  exports: [ChatrepoService],
})
export class ChatrepoModule {}
