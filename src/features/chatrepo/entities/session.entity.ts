import {
  Table,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
  Model,
} from 'sequelize-typescript'
import { AuthingUser } from './../../user/authing.user.entity'

@Table({
  tableName: 't_session',
})
export class Session extends Model<Session> {
  @Column({
    allowNull: false,
    type: DataType.STRING(40),
  })
  name: string

  @ForeignKey(() => AuthingUser)
  @Column({
    allowNull: false,
    type: DataType.INTEGER,
  })
  userId: number

  @BelongsTo(() => AuthingUser, 'userId')
  user: AuthingUser
}
