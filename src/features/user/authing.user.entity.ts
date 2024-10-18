import {
  Column,
  DefaultScope,
  Scopes,
  Table,
  DataType,
  HasOne,
  Model,
} from 'sequelize-typescript'
import { Injectable } from '@nestjs/common'
import { BaseModel } from './../../core'

@Injectable()
@DefaultScope(() => ({
  where: {
    isActive: true,
  },
  // attributes: {
  //   exclude: [
  //     'isActive',
  //     'syncKey',
  //     'passwd',
  //     'passwdExpireDate',
  //     'appId',
  //     'appSecret',
  //     'mobile',
  //     'email',
  //     'updatedAt',
  //   ],
  // },
}))
@Scopes(() => ({
  findAll: {},
  findOne: {},
  enable: {
    where: {
      isEnable: true,
    },
  },
}))
@Table({
  tableName: 't_authing_user',
  timestamps: true,
  indexes: [
    // {
    //   fields: ['isActive'],
    // },
    {
      fields: ['openId', 'isActive'],
      unique: true,
    },
    // {
    //   fields: ['name'],
    // },
    // {
    //   fields: ['mobile'],
    // },
    // {
    //   fields: ['email'],
    // },
    // {
    //   fields: ['isEnable'],
    // },
  ],
})
export class AuthingUser extends BaseModel<AuthingUser> {
  @Column({
    allowNull: false,
    type: DataType.STRING(255),
    comment: '用户名',
  })
  userName: string

  @Column({
    allowNull: true,
    type: DataType.STRING(255),
    comment: '手机号',
  })
  mobile?: string

  @Column({
    allowNull: true,
    type: DataType.STRING(255),
    comment: '邮箱',
  })
  email?: string

  @Column({
    allowNull: false,
    type: DataType.STRING(255),
    comment: '密码',
  })
  passwd: string

  @Column({
    allowNull: true,
    type: DataType.STRING(255),
    comment: '头像',
  })
  avatar?: string

  @Column({
    allowNull: true,
    type: DataType.STRING(255),
    comment: '备注',
  })
  remark?: string

  @Column({
    allowNull: false,
    type: DataType.BOOLEAN,
    defaultValue: true,
    comment: '是否有效',
  })
  isEnable: boolean

  @Column({
    allowNull: true,
    type: DataType.DATE,
    comment: '最后登录时间',
  })
  lastLoginTime?: Date

  @Column({
    allowNull: true,
    type: DataType.STRING(255),
    comment: 'appId',
  })
  appId?: string

  @Column({
    allowNull: true,
    type: DataType.STRING(255),
    comment: 'app秘钥',
  })
  appSecret?: string

  @Column({
    type: DataType.VIRTUAL,
    comment: '用户所属角色',
  })
  roles?: any

  @Column({
    allowNull: true,
    type: DataType.DATE,
    comment: '密码过期时间',
  })
  passwdExpireDate?: Date

  @Column({
    allowNull: true,
    type: DataType.INTEGER,
    comment: '用户类型',
  })
  type?: number

  @Column(DataType.STRING(32))
  openId: string

  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  isActive?: boolean

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    onUpdate: 'NO ACTION',
    onDelete: 'NO ACTION',
    comment: '租户id',
  })
  tenantId?: number

  @Column({
    type: DataType.VIRTUAL,
  })
  get isAdmin(): boolean {
    return this.id === 1
  }
}
