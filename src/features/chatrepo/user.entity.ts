import {
  Table,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
  Model,
} from 'sequelize-typescript';

@Table({
  tableName: 't_user',
})
export class User extends Model<User> {
  @Column({
    allowNull: false,
    type: DataType.STRING(40),
  })
  name: string;
}