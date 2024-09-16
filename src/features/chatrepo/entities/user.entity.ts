import {
  Table,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
  Model,
} from 'sequelize-typescript'

// gpt-3.5 $0.002 / 1K tokens
// https://openai.com/pricing

@Table({
  tableName: 't_user',
})
export class User extends Model<User> {
  @Column({
    allowNull: false,
    type: DataType.STRING(40),
  })
  uid: string

  @Column({
    allowNull: false,
    type: DataType.STRING(40),
  })
  name: string

  @Column({
    allowNull: false,
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  isEnable: boolean
}
