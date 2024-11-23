import { Injectable, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { Chat } from '../entities/chatrepo.entity'
import { Session } from '../entities/session.entity'
import { Op } from 'sequelize'
// import { ENGLISH_TEACHER_PROMPT } from './prompts'
import axios from 'axios'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class ChatrepoService {
  private logger = new Logger(ChatrepoService.name)

  constructor(
    @InjectModel(Chat)
    private readonly ChatModel: typeof Chat,
    @InjectModel(Session)
    private readonly SessionModel: typeof Session,
    private readonly configService: ConfigService,
  ) {}

  create(payload: {
    sessionId: number
    role: string
    content: string
    name?: string
    promptTokens?: number
    completionTokens?: number
  }) {
    return this.ChatModel.create(payload)
  }

  async init(userId: number, promptId: number) {
    this.logger.verbose(`init - userId: ${userId} promptid: ${promptId}`)

    const response = await axios.get(
      `https://admin.tiusolution.com/api/prompt/${promptId}`,
      {
        params: {
          token: this.configService.get('auth.superToken'),
        },
      },
    )

    const session = await this.SessionModel.create({
      name: '',
      userId,
    })

    return this.ChatModel.create({
      sessionId: session.id,
      role: 'system',
      content: response.data.data.template,
    })
  }

  findAllBySessionId(sessionId: number, maxId?: number) {
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
    })
  }

  async findLatestSession(userId: number) {
    const latestSession = await this.SessionModel.findOne({
      where: {
        userId,
      },
      order: [['id', 'desc']],
    })

    if (latestSession) {
      return {
        latestSession,
        chatHistories: await this.findAllBySessionId(latestSession.id),
      }
    }
  }
}
