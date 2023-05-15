import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Chat } from './chatrepo.entity';
import { Op } from 'sequelize';

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

  findAllBySession(session: string, maxId?: number) {
    return this.ChatModel.findAll({
      attributes: ['role', 'content'],
      where: {
        session,
        id: {
          [Op.gt]: maxId || 0,
        },
      },
      order: [['id', 'asc']],
    });
  }
}
