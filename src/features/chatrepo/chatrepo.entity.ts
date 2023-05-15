import {
  Table,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
  Model,
} from 'sequelize-typescript';

@Table({
  tableName: 't_chat',
})
export class Chat extends Model<Chat> {
  @Column({
    allowNull: false,
    type: DataType.STRING(40),
  })
  session: string;

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
