import { nanoid } from 'nanoid'
import {
  Model,
  Column,
  DataType,
  AllowNull,
  Comment,
  Default,
  Unique,
  DefaultScope,
  BeforeBulkUpdate,
} from 'sequelize-typescript'
import { QueryTypes } from 'sequelize'

@DefaultScope(() => ({
  where: {
    isActive: true,
  },
  attributes: {
    exclude: ['isActive', 'syncKey'],
  },
}))
export class BaseModel<T> extends Model<T> {
  @Comment('同步Key')
  @AllowNull(false)
  @Default(() => nanoid(32))
  @Unique(true)
  @Column(DataType.STRING(32))
  syncKey: string

  @Comment('是否有效')
  @AllowNull(true)
  @Default(true)
  @Column
  isActive?: boolean

  /**
    attributes: { isActive: true, updatedAt: 2022-11-18T09:35:57.322Z },
    validate: true,
    hooks: true,
    individualHooks: false,
    returning: false,
    force: false,
    sideEffects: true,
    type: 'BULKUPDATE',
    fields: [ 'isActive', 'updatedAt' ],
    model: EquipmentCategory,
    skip: undefined
   */
  @BeforeBulkUpdate
  static async methodName(instance: any) {
    if (
      !instance ||
      !instance.where ||
      !('isActive' in instance.where) ||
      !instance.where.id ||
      !instance.attributes ||
      instance.attributes.isActive !== null
    ) {
      return
    }

    const sql = `
        select table_name   as tableName,
               column_name  as columnName
        from information_schema.KEY_COLUMN_USAGE
        where referenced_table_name is not null
              and table_schema = '${process.env.MYSQL_DB}'
              and referenced_table_name = '${instance.model.tableName}';
      `
    /**
     * 找到和软删除数据有关联的表以及有关联的字段
     */
    const rows = await instance.transaction.sequelize.query(sql, {
      type: QueryTypes.SELECT,
    })

    if (rows && rows.length > 0) {
      const sqls = []
      for (const row of rows) {
        /**
         * 逐个查询这些关联表中的数据是否出于活跃状态
         */
        sqls.push(
          `select 1 from ${row.tableName} where ${row.columnName} = ${instance.where.id} and isActive = 1`,
        )
      }

      const finalSql = `select count(*) as cnt from (${sqls.join(
        ' union all ',
      )}) t`

      const result = await instance.transaction.sequelize.query(finalSql, {
        type: QueryTypes.SELECT,
        transaction: instance.transaction,
      })
      /**
       * 如果查询到有关联数据处于活跃状态则不予软删除
       */
      if (result && result.length === 1 && result[0]['cnt'] > 0) {
        throw new Error('SequelizeForeignKeyConstraintError')
      }
    }
  }
}
