import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Chat } from './chatrepo.entity';
import { Session } from './session.entity';
import { Op } from 'sequelize';
import { ENGLISH_TEACHER_PROMPT } from './prompts';

@Injectable()
export class ChatrepoService {
  constructor(
    @InjectModel(Chat)
    private readonly ChatModel: typeof Chat,
    @InjectModel(Session)
    private readonly SessionModel: typeof Session,
  ) {}

  create(payload: {
    sessionId: number;
    role: string;
    content: string;
    name?: string;
    promptTokens?: number;
    completionTokens?: number;
  }) {
    return this.ChatModel.create(payload);
  }

  async init() {
    const session = await this.SessionModel.create({
      name: '',
      userId: 1,
    });

    return this.ChatModel.create({
      sessionId: session.id,
      role: 'system',
      content: ENGLISH_TEACHER_PROMPT,
    });
  }

  findAllBySession(sessionId: number, maxId?: number) {
    return this.ChatModel.findAll({
      attributes: ['role', 'content'],
      where: {
        sessionId,
        id: {
          [Op.gt]: maxId || 0,
        },
        role: {
          [Op.ne]: 'system',
        },
      },
      order: [['id', 'asc']],
    });
  }
}
