import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Chat } from './chatrepo.entity';

@Injectable()
export class ChatrepoService {
  constructor(
    @InjectModel(Chat)
    private readonly ChatModel: typeof Chat,
  ) {}

  create(payload: {
    session: string;
    role: string;
    content: string;
    name?: string;
    promptTokens?: number;
    completionTokens?: number;
  }) {
    return this.ChatModel.create(payload);
  }

  findAllBySession(session: string) {
    return this.ChatModel.findAll({
      attributes: ['role', 'content'],
      where: {
        session,
      },
      order: [['id', 'asc']],
    });
  }
}
