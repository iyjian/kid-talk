import { Injectable } from '@nestjs/common'
import _ from 'lodash'
import { Op } from 'sequelize'
import XLSX from 'xlsx'
import { allOperators } from '../interfaces'
import exceljs from 'exceljs'
import { PassThrough, Readable } from 'stream'

interface HeaderConfig {
  key: string
  name: string
  width: number
  bgColor: string
  color: string
  type: string
  align?: string
}

@Injectable()
export class BaseService {
  /**
   * 忽略对象里的空值
   * 比如将
   * {
   *    shipIp: undefined,
   *    departmentId: null
   *    employeeId: 1
   * }
   * 转化为：
   * {
   *    employeeId: 1
   * }
   */
  protected omitEmptyProperty(obj: object): any {
    return _(obj).omitBy(_.isUndefined).omitBy(_.isNull).value()
  }

  /**
   * 用链式方式从对象中获取值，比如用'a.b'获取对象中a节点下的b节点的值
   *
   * @param obj - {a: 1, b: {c: 1}}
   * @param key - 'a.b'
   * @returns
   */
  private getValByKey(obj: object, key: string) {
    if (!key) {
      throw new Error('key can not be empty')
    }
    const keyPath = key.split('.')
    if (keyPath.length === 1) {
      return obj[key]
    } else {
      try {
        let val = obj
        for (const keyNode of keyPath) {
          val = val[keyNode]
        }
        return val
      } catch (e) {
        return undefined
      }
    }
  }

  /**
   * 默认excel只有一个sheet,且含有表头(在首行)
   *
   * @UseInterceptors(FileInterceptor('file'))
   * excelUpload(@UploadedFile() file: Express.Multer.File) {
   *    this.XLSXFileToJson(file, ['A', 'B', 'C'])
   * }
   *
   * @param file - 文件
   * @param header - 列名 ['cnName', 'enName', 'etc.']
   * @returns
   */
  public XLSXFileToJson(
    // file: Express.Multer.File,
    file: any,
    header: string[],
    sheetIdx: number = 0,
  ): any[] {
    const workbook = XLSX.read(file.buffer)
    return XLSX.utils.sheet_to_json(
      workbook.Sheets[workbook.SheetNames[sheetIdx]],
      {
        header,
        range: 1,
      },
    )
  }

  // 把json转为excel流

  public jsonToXLSXStream(
    headerConfig: HeaderConfig[],
    jsonReadableStream: Readable,
  ): Readable {
    const passThrough = new PassThrough()
    const workbook = new exceljs.stream.xlsx.WorkbookWriter({
      stream: passThrough,
      useStyles: true,
      useSharedStrings: true,
    })
    const worksheet = workbook.addWorksheet('Sheet1')

    // 设置列配置
    worksheet.columns = headerConfig.map((header) => ({
      header: header.name,
      key: header.key,
      width: header.width,
    }))

    // 应用表头样式
    const headerRow = worksheet.getRow(1)
    headerConfig.forEach((header, index) => {
      const cell = headerRow.getCell(index + 1)
      cell.value = header.name
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: header.bgColor.replace('#', '') },
      }
      cell.font = {
        color: { argb: header.color.replace('#', '') },
        bold: true,
      }
      if (header.align) {
        cell.alignment = {
          horizontal: header.align as 'center' | 'left' | 'right',
        }
      }
    })
    headerRow.commit()

    // 异步处理JSON数据流并添加数据行
    ;(async () => {
      for await (const chunk of jsonReadableStream) {
        const data = JSON.parse(chunk.toString())
        const row = []
        headerConfig.forEach((header) => {
          row.push(data[header.key])
        })
        worksheet.addRow(row).commit()
      }

      // 流结束时的处理
      worksheet.commit()
      await workbook.commit()
      passThrough.end()
    })()

    return passThrough
  }

  /**
   * 把json数组数据转成excel
   *
   * import { Response } from 'express'
   *
   * excelExport (@Res() res: Response) {
   * res.set('Content-Type', 'application/vnd.ms-excel')
   * res.set(
   *   'Content-Disposition',
   *   `attachment;filename=${moment().format(
   *     'YYYY-MM-DD-HH-MM-SS',
   *   )}.xlsx`,
   * )
   * res.send(buffer)
   * }
   *
   * @param table - [{id: 1, alias: '一号闸机', ip: '10.1.1.23', type: {name: '邮轮专用'}}, {alias: '二号闸机', ip: '10.1.1.24', type: {name: '班轮专用'}}]
   * @param headerConfig - [{key: 'id', name: '编号', width: 5, bgColor: 'F000066', color: 'FFFFFFFF',type: 'number',align: center}]
   * @returns
   */
  public arrToXLSXBuffer(
    rows: object[],
    headerConfigs: HeaderConfig[],
  ): Promise<exceljs.Buffer> {
    const tableData: any = []
    const header = headerConfigs.map((headerConfig) => headerConfig.name)

    for (const row of rows) {
      const rowData = []
      for (const headerConfig of headerConfigs) {
        rowData.push(this.getValByKey(row, headerConfig.key))
      }
      tableData.push(rowData)
    }

    const workbook = new exceljs.Workbook()
    const worksheet = workbook.addWorksheet('sheet1')

    worksheet.addRow(header)
    worksheet.addRows(tableData)

    for (const row of worksheet.getRows(1, worksheet.rowCount)) {
      for (let cellIndex = 0; cellIndex < row.cellCount; cellIndex++) {
        const cell = row.getCell(cellIndex + 1)

        // 如果是表头行
        if (row.number === 1) {
          cell.font = {
            color: { argb: headerConfigs[cellIndex].color },
          }

          // 设置背景颜色
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: headerConfigs[cellIndex].bgColor },
          }

          // 标题文字居中
          cell.alignment = {
            horizontal: 'center',
          }

          // 设置列宽
          worksheet.getColumn(cellIndex + 1).width =
            headerConfigs[cellIndex].width
          continue
        }

        if (headerConfigs[cellIndex].align) {
          cell.alignment = {
            horizontal: headerConfigs[cellIndex].align as
              | 'left'
              | 'center'
              | 'right',
          }
          if (headerConfigs[cellIndex].type === 'string') {
            cell.alignment.wrapText = true
            cell.numFmt = '@'
          }
          continue
        }

        if (headerConfigs[cellIndex].type === 'string') {
          cell.alignment = {
            horizontal: 'left',
          }

          // 设置自动换行
          cell.alignment.wrapText = true

          // 设置单元格格式为文本
          cell.numFmt = '@'
        }

        if (headerConfigs[cellIndex].type === 'number') {
          cell.alignment = {
            horizontal: 'right',
          }
        }
      }
    }

    return workbook.xlsx.writeBuffer()
  }

  /**
   * 递归的深度的遍历include配置，过滤掉所有的undefined：
   * include: [
   *   {
   *      model: 'testModel1',
   *      include: [undefined]
   *    },
   *    {
   *      model: 'testModel2',
   *      include: [
   *        {
   *          model: 'testModel3',
   *        }
   *      ]
   *    },
   *    undefined
   *  ]
   * 经过处理后变成：
   * include: [
   *   {
   *      model: testModel1,
   *    },
   *    {
   *      model: testModel2,
   *      include: [
   *        {
   *          model: testModel3,
   *        }
   *      ]
   *    },
   *  ]
   *
   *  应用场景：如果需要根据参数动态的决定是否要include某个model则有可能在include的地方产生一个undefined，
   *  此时sequelize无法识别这个undefined，需要过滤一下，比如以下写法：
   * include: [
   *   {
   *      model: 'testModel1',
   *      include: [needInclude ? {model: model1} : undefined]
   *    },
   *    {
   *      model: 'testModel2',
   *      include: [
   *        {
   *          model: 'testModel3',
   *        }
   *      ]
   *    },
   *    needInclude ? {model: model2} : undefined
   *  ]
   */
  protected cleanInclude(include: any[]) {
    return include
      .filter((o) => o !== undefined)
      .map((config) => {
        const item = {}
        for (const key in config) {
          if (key === 'include') {
            item[key] = this.cleanInclude(config[key])
          } else {
            item[key] = config[key]
          }
        }
        return item
      })
  }

  /**
   * 给定数组A [1, 2]  数组B [2, 3, 4]
   * 计算数组B中不存在的集合(toBeAdded) [1]
   * 计算数组B中存在A中不存在的数据(toBeDeleted) [3, 4]
   *
   * 应用场景:
   * 比如有张表trainings用来记录每个培训课程有哪些员工参加, trainings表的字段如下：
   *
   * courseId employeeId
   *    1         2
   *    1         3
   *    1         4
   *
   * 如果通过调用接口，以重新安排参加培训的员工
   * Patch /trainings payload: {courseId: 1, employeeIds: [1, 2]}
   *
   * 则需要先查询出trainings表中已有的employeeIds和新的employeeIds进行对比，
   *
   * >> 找出新增加的employeeIds以在trainings表中新增
   * >> 找出原本参加课程，现在不需要参加的employeeIds以在trainings表中删除
   */
  protected getDiffBaseOnExistingRecord(newArray: any[], existingArr: any[]) {
    const toBeAdded = _.intersection(
      _.xor(existingArr, newArray || []),
      newArray,
    )

    const toBeDeleted = _.intersection(
      _.xor(existingArr, newArray || []),
      existingArr,
    )
    return { toBeAdded, toBeDeleted }
  }

  protected normalizeCondition(payload: any) {
    const condition = _.cloneDeep(payload)

    for (const key in condition) {
      if (key.indexOf('.') !== -1) {
        condition[`\$${key}\$`] = payload[key]
        delete condition[key]
      }
    }

    for (const key in condition) {
      if (_.isPlainObject(condition[key])) {
        for (const key2 in condition[key]) {
          if (key2 === 'isnull') {
            if (condition[key][key2] === 'true') {
              condition[key][Op.eq] = null
            } else {
              condition[key][Op.ne] = null
            }
            delete condition[key][key2]
          } else if (allOperators.includes(key2)) {
            condition[key][Op[key2]] = condition[key][key2]
            delete condition[key][key2]
          }
        }
      }
    }
    return condition
  }

  protected normalizeMeiliCondition(payload: any) {
    const filter = []

    for (const key in payload) {
      if (_.isPlainObject(payload[key])) {
        for (const key2 in payload[key]) {
          if (key2 === 'in') {
            const condition = `${key} IN [${payload[key][key2]
              .map((o) => `"${o}"`)
              .join(',')}]`
            filter.push(condition)
          }
        }
      } else {
        const condition = `${key}='${payload[key]}'`
        filter.push(condition)
      }
    }
    return filter
  }

  protected normallizeMongoCondition(payload: any) {
    const condition = _.cloneDeep(payload)

    for (const key in payload) {
      if (_.isPlainObject(payload[key])) {
        for (const key2 in payload[key]) {
          if (['gte', 'gt', 'lt', 'lte'].includes(key2)) {
            condition[key][`$${key2}`] = condition[key][key2]
            delete condition[key][key2]
          }
        }
      }
    }

    return condition
  }

  protected sleep(ms: number) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true)
      }, ms)
    })
  }
}
