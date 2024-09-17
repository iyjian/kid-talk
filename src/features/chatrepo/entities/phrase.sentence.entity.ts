import {
  Table,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
  Model,
  Scopes,
} from 'sequelize-typescript'
import { codeGen, BaseModel } from './../../../core'

@Table({
  tableName: 't_phrase_sentence',
})
@codeGen('scopesGen')
@Scopes(() => ({
  findAll: {
    include: [],
  },
  findOne: {
    include: [],
  },
}))
export class PhraseSentence extends BaseModel<PhraseSentence> {
  @Column({
    allowNull: false,
    type: DataType.STRING,
  })
  phrase: string

  @Column({
    allowNull: false,
    type: DataType.TEXT,
  })
  sentence: string

  @Column({
    allowNull: false,
    type: DataType.STRING(40),
  })
  voice: string

  @Column({
    allowNull: false,
    type: DataType.TEXT('long'),
  })
  audio: string

  @Column({
    allowNull: false,
    type: DataType.INTEGER,
    defaultValue: false,
  })
  // value from `0.25` to `4.0`. `1.0` is the default.
  speed: number

  @Column({
    allowNull: true,
    type: DataType.STRING(40),
    comment: '单元',
  })
  @codeGen('11046')
  unit?: string

  @Column({
    allowNull: true,
    type: DataType.STRING(40),
    comment: '年级',
  })
  @codeGen('11047')
  grade?: string
}
