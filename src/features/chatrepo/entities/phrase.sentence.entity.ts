import {
  Table,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
  Model,
  Scopes,
} from 'sequelize-typescript'
import { codeGen } from './../../../core'

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
export class PhraseSentence extends Model<PhraseSentence> {
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
}
