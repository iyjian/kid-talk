import {
  Table,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
  Model,
} from 'sequelize-typescript';
import { Session } from './session.entity';

@Table({
  tableName: 't_chat',
})
export class Chat extends Model<Chat> {
  @ForeignKey(() => Session)
  @Column({
    allowNull: false,
    type: DataType.STRING(40),
  })
  sessionId: number;

  @BelongsTo(() => Session, 'sessionId')
  session: Session;

  @Column({
    allowNull: false,
    type: DataType.STRING(40),
  })
  role: string;

  @Column({
    allowNull: false,
    type: DataType.TEXT,
  })
  content: string;

  @Column({
    allowNull: true,
    type: DataType.STRING(40),
  })
  name: string;

  @Column({
    allowNull: true,
    type: DataType.INTEGER,
  })
  promptTokens: number;

  @Column({
    allowNull: true,
    type: DataType.INTEGER,
  })
  completionTokens: number;
}
