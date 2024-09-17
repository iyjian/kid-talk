import { PagingRequestDTO, getTransformer, codeGen } from './../../../core'
import { Transform, Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'

export class CreatePhraseSentenceRequestDTO {
  @codeGen('11041')
  @ApiProperty({
    description: '短语',
    required: false,
  })
  phrase?: string

  @codeGen('11042')
  @ApiProperty({
    description: '句子',
    required: false,
  })
  sentence?: string

  @codeGen('11043')
  @ApiProperty({
    description: '音色',
    required: false,
  })
  voice?: string

  @codeGen('11044')
  @ApiProperty({
    description: '音频',
    required: false,
  })
  audio?: string

  @codeGen('11045')
  @ApiProperty({
    description: '语速',
    required: false,
  })
  @Transform(getTransformer('numberTransformer'))
  speed?: number

  @codeGen('11046')
  @ApiProperty({
    description: '单元',
    required: false,
  })
  unit?: string

  @codeGen('11047')
  @ApiProperty({
    description: '年级',
    required: false,
  })
  grade?: string
}

export class UpdatePhraseSentenceRequestDTO {
  @codeGen('11041')
  @ApiProperty({
    description: '短语',
    required: false,
  })
  phrase?: string

  @codeGen('11042')
  @ApiProperty({
    description: '句子',
    required: false,
  })
  sentence?: string

  @codeGen('11043')
  @ApiProperty({
    description: '音色',
    required: false,
  })
  voice?: string

  @codeGen('11044')
  @ApiProperty({
    description: '音频',
    required: false,
  })
  audio?: string

  @codeGen('11045')
  @ApiProperty({
    description: '语速',
    required: false,
  })
  @Transform(getTransformer('numberTransformer'))
  speed?: number

  @codeGen('11046')
  @ApiProperty({
    description: '单元',
    required: false,
  })
  unit?: string

  @codeGen('11047')
  @ApiProperty({
    description: '年级',
    required: false,
  })
  grade?: string
}

export class FindOnePhraseSentenceRequestDTO {
  @codeGen('11041')
  @ApiProperty({
    description: '短语',
    required: false,
  })
  phrase?: string

  @codeGen('11042')
  @ApiProperty({
    description: '句子',
    required: false,
  })
  sentence?: string

  @codeGen('11043')
  @ApiProperty({
    description: '音色',
    required: false,
  })
  voice?: string

  @codeGen('11044')
  @ApiProperty({
    description: '音频',
    required: false,
  })
  audio?: string

  @codeGen('11045')
  @ApiProperty({
    description: '语速',
    required: false,
  })
  @Transform(getTransformer('numberTransformer'))
  speed?: number

  @codeGen('11046')
  @ApiProperty({
    description: '单元',
    required: false,
  })
  unit?: string

  @codeGen('11047')
  @ApiProperty({
    description: '年级',
    required: false,
  })
  grade?: string
}

export class FindAllPhraseSentenceRequestDTO extends PagingRequestDTO {
  @codeGen('11041')
  @ApiProperty({
    description: '短语',
    required: false,
  })
  phrase?: string

  @codeGen('11042')
  @ApiProperty({
    description: '句子',
    required: false,
  })
  sentence?: string

  @codeGen('11043')
  @ApiProperty({
    description: '音色',
    required: false,
  })
  voice?: string

  @codeGen('11044')
  @ApiProperty({
    description: '音频',
    required: false,
  })
  audio?: string

  @codeGen('11045')
  @ApiProperty({
    description: '语速',
    required: false,
  })
  @Transform(getTransformer('numberTransformer'))
  speed?: number

  @codeGen('11046')
  @ApiProperty({
    description: '单元',
    required: false,
  })
  unit?: string

  @codeGen('11047')
  @ApiProperty({
    description: '年级',
    required: false,
  })
  grade?: string
}
