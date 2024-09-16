import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { Request } from 'express';
import { getTransformer } from '../transforms';
import _ from 'lodash';

class SortCommand {
  @ApiProperty({
    description: '排序键',
    required: false,
  })
  key: string;

  @ApiProperty({
    description: '排序方向',
    required: false,
  })
  order: 'desc' | 'asc';
}

export class PagingRequestDTO {
  @Transform(({ value }) => {
    if (value === 'true' || value === '1') return true;
    if (value === 'false' || value === '0') return false;
    return value;
  })
  @ApiProperty({
    description: '是否忽略分页',
    required: false,
  })
  @Transform(getTransformer('booleanTransformer'))
  skipPaging?: boolean;

  @Type(() => Number)
  @ApiProperty({
    description: '页数(从1开始)',
    default: 1,
    required: false,
  })
  @Transform(getTransformer('numberTransformer'))
  page?: number = 1;

  @Type(() => Number)
  @ApiProperty({
    description: '每页数据条数',
    default: 20,
    required: false,
  })
  @Transform(getTransformer('numberTransformer'))
  pageSize?: number = 20;

  @ApiProperty({
    description: '搜索条件',
    required: false,
  })
  search?: string;

  @ApiProperty({
    description: '排序条件',
    required: false,
    isArray: true,
  })
  @Transform(({ value }) => {
    if (value) {
      return value.map((o: SortCommand) => [o.key, o.order]);
    }
  })
  sort?: [string, string][];
}

interface Locals extends Record<string, any> {
  user: any;
  token?: string;
}

export interface AuthingRequest extends Request {
  locals: Locals;
  query: { token?: string; appId?: string; nonce?: string; sign?: string };
}

const SequelizeBaseOperators = ['eq', 'ne', 'isnull'] as const;

type SequelizeBaseOperator = (typeof SequelizeBaseOperators)[number];

const SequelizeBaseArrayOperators = ['or', 'and', 'in', 'notIn'] as const;

type SequelizeBaseArrayOperator = (typeof SequelizeBaseArrayOperators)[number];

const SequelizeCompareOperators = ['gt', 'gte', 'lt', 'lte'] as const;

type SequelizeCompareOperator = (typeof SequelizeCompareOperators)[number];

const SequelizeCompareRangeOperators = ['between', 'notbetween'] as const;

type SequelizeCompareRangeOperator =
  (typeof SequelizeCompareRangeOperators)[number];

const SequelizeStringOperators = [
  'like',
  'notLike',
  'startsWith',
  'endsWith',
  'iLike',
  'notIlike',
  'regexp',
] as const;

type SequelizeStringOperator = (typeof SequelizeStringOperators)[number];

const SequelizeBooleanOperators = ['is', 'not'] as const;

type SequelizeBooleanOperators = (typeof SequelizeBooleanOperators)[number];

export const allOperators = _.flatten(
  _.concat([
    SequelizeBaseOperators,
    SequelizeBaseArrayOperators,
    SequelizeCompareOperators,
    SequelizeStringOperators,
    SequelizeBooleanOperators,
  ]),
) as any as string[];

export type RequestString =
  | string
  | { [key in SequelizeBaseOperator]?: string | RequestString }
  | { [key in SequelizeBaseArrayOperator]?: string[] | RequestString }
  | { [key in SequelizeStringOperator]?: string | RequestString };

export type RequestNumber =
  | number
  | { [key in SequelizeBaseOperator]?: number | RequestNumber }
  | { [key in SequelizeBaseArrayOperator]?: number[] | RequestNumber }
  | { [key in SequelizeCompareOperator]?: number | RequestNumber }
  | { [key in SequelizeCompareRangeOperator]?: number[] | RequestNumber };

export type RequestDate =
  | Date
  | { [key in SequelizeBaseOperator]?: Date | RequestDate }
  | { [key in SequelizeBaseArrayOperator]?: Date[] | RequestDate }
  | { [key in SequelizeCompareOperator]?: Date | RequestDate }
  | { [key in SequelizeCompareRangeOperator]?: Date[] | RequestDate };

export type RequestBoolean =
  | boolean
  | { [key in SequelizeBooleanOperators]?: boolean | RequestBoolean };
