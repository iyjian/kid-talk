import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/sequelize'
import { Op, QueryTypes, Transaction } from 'sequelize'
import { Sequelize } from 'sequelize-typescript'
import { BaseService } from './../../../core'
import { PhraseSentence } from './../entities/phrase.sentence.entity'
import {
  FindAllPhraseSentenceRequestDTO,
  FindOnePhraseSentenceRequestDTO,
  CreatePhraseSentenceRequestDTO,
  UpdatePhraseSentenceRequestDTO,
} from './../dto/phrase.sentence.request.dto'

@Injectable()
export class PhraseSentenceService extends BaseService {
  private readonly include: any[]
  private readonly includeForOne: any[]
  private readonly logger = new Logger(PhraseSentenceService.name)

  constructor(
    @InjectModel(PhraseSentence)
    private readonly phraseSentenceModel: typeof PhraseSentence,
    private readonly mysql: Sequelize,
  ) {
    super()
    this.include = []
    this.includeForOne = []
  }

  async create(
    createPhraseSentenceRequest: CreatePhraseSentenceRequestDTO,
    transaction?: Transaction,
  ) {
    const isOuterTransaction = !!transaction
    try {
      if (!isOuterTransaction) {
        transaction = await this.mysql.transaction()
      }

      const phraseSentence = await this.phraseSentenceModel.create(
        createPhraseSentenceRequest,
        { transaction },
      )

      if (!isOuterTransaction) {
        await transaction.commit()
        return this.findOneById(phraseSentence.id)
      } else {
        return this.findOneById(phraseSentence.id, transaction)
      }
    } catch (e) {
      if (!isOuterTransaction && transaction) {
        await transaction.rollback()
      }
      throw e
    }
  }

  async findAllUnits() {
    // const phraseSentences = await this.phraseSentenceModel.findAll({
    //   attributes: ['grade', 'unit'],
    //   distinct: true
    // })
    return this.mysql.query(
      `select distinct concat(grade, '/' ,unit) as unitName, unit, grade from t_phrase_sentence`,
      { type: QueryTypes.SELECT },
    )
  }

  async findAll(
    findAllPhraseSentenceRequest: FindAllPhraseSentenceRequestDTO,
    transaction?: Transaction,
  ) {
    const {
      page = 1,
      pageSize = 20,
      skipPaging,
      search,
      sort = [['id', 'desc']],
      attributes = undefined,
      ...payload
    } = findAllPhraseSentenceRequest

    const condition = this.normalizeCondition(payload)

    if (search) {
      condition[Op.or] = {}
    }

    const phraseSentences = await this.phraseSentenceModel
      .scope(['defaultScope', 'findAll'])
      .findAndCountAll({
        where: { ...condition },
        attributes,
        offset: skipPaging ? undefined : (page - 1) * pageSize,
        limit: skipPaging ? undefined : pageSize,
        order: sort,
        transaction,
      })

    return phraseSentences
  }

  async findOneById(id: number, transaction?: Transaction) {
    const phraseSentence = await this.phraseSentenceModel
      .scope(['defaultScope', 'findOne'])
      .findByPk(id, {
        transaction,
      })

    return phraseSentence
  }

  async findByIds(ids: number[], transaction?: Transaction) {
    const phraseSentences = await this.phraseSentenceModel.findAll({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
      transaction,
    })

    return phraseSentences
  }

  async findOneByIdOrThrow(id: number, transaction?: Transaction) {
    const phraseSentence = await this.phraseSentenceModel
      .scope(['defaultScope', 'findOne'])
      .findByPk(id, {
        transaction,
      })

    if (!phraseSentence) {
      throw new HttpException('未找到该记录', HttpStatus.NOT_FOUND)
    }

    return phraseSentence
  }

  async findOneOrThrow(
    findOnePhraseSentenceRequest: FindOnePhraseSentenceRequestDTO,
    transaction?: Transaction,
  ) {
    const phraseSentence = await this.phraseSentenceModel
      .scope(['defaultScope', 'findOne'])
      .findOne({
        where: { ...findOnePhraseSentenceRequest },
        transaction,
      })

    if (!phraseSentence) {
      throw new HttpException('未找到该记录', HttpStatus.NOT_FOUND)
    }

    return phraseSentence
  }

  async findOne(
    findOnePhraseSentenceRequest: FindOnePhraseSentenceRequestDTO,
    transaction?: Transaction,
  ) {
    const phraseSentence = await this.phraseSentenceModel
      .scope(['defaultScope', 'findOne'])
      .findOne({
        where: { ...findOnePhraseSentenceRequest },
        transaction,
      })

    return phraseSentence
  }

  async updateById(
    id: number,
    updatePhraseSentenceRequest: UpdatePhraseSentenceRequestDTO,
    transaction?: Transaction,
  ) {
    await this.phraseSentenceModel.update(updatePhraseSentenceRequest, {
      where: {
        id,
      },
      transaction,
    })
    return true
  }

  async removeById(id: number, transaction?: Transaction) {
    const isOuterTransaction = !!transaction
    try {
      if (!transaction) {
        transaction = await this.mysql.transaction()
      }

      await this.phraseSentenceModel.update(
        { isActive: null },
        {
          where: {
            id,
          },
          transaction,
        },
      )

      if (!isOuterTransaction) {
        await transaction.commit()
      }
      return true
    } catch (e) {
      if (transaction && !isOuterTransaction) {
        await transaction.rollback()
        if (e.toString() === 'Error: SequelizeForeignKeyConstraintError') {
          throw new Error('有依赖数据，无法删除')
        }
      }
      throw e
    }
  }
}
