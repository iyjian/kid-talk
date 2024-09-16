import {
  Table,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
  Model,
} from 'sequelize-typescript'
import { User } from './user.entity'

@Table({
  tableName: 't_session',
})
export class Session extends Model<Session> {
  @Column({
    allowNull: false,
    type: DataType.STRING(40),
  })
  name: string

  @ForeignKey(() => User)
  @Column({
    allowNull: false,
    type: DataType.INTEGER,
  })
  userId: number

  @BelongsTo(() => User, 'userId')
  user: User
}
