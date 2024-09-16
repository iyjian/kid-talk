import { PagingRequestDTO, getTransformer, codeGen } from './../../../core'
import { Transform, Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'

export class CreatePhraseSentenceRequestDTO {
  @codeGen('11041')
  @ApiProperty({
    description: '',
    required: false,
  })
  phrase?: string

  @codeGen('11042')
  @ApiProperty({
    description: '',
    required: false,
  })
  sentence?: string

  @codeGen('11043')
  @ApiProperty({
    description: '',
    required: false,
  })
  voice?: string

  @codeGen('11044')
  @ApiProperty({
    description: '',
    required: false,
  })
  audio?: string

  @codeGen('11045')
  @ApiProperty({
    description: '',
    required: false,
  })
  @Transform(getTransformer('numberTransformer'))
  speed?: number
}

export class UpdatePhraseSentenceRequestDTO {
  @codeGen('11041')
  @ApiProperty({
    description: '',
    required: false,
  })
  phrase?: string

  @codeGen('11042')
  @ApiProperty({
    description: '',
    required: false,
  })
  sentence?: string

  @codeGen('11043')
  @ApiProperty({
    description: '',
    required: false,
  })
  voice?: string

  @codeGen('11044')
  @ApiProperty({
    description: '',
    required: false,
  })
  audio?: string

  @codeGen('11045')
  @ApiProperty({
    description: '',
    required: false,
  })
  @Transform(getTransformer('numberTransformer'))
  speed?: number
}

export class FindOnePhraseSentenceRequestDTO {
  @codeGen('11041')
  @ApiProperty({
    description: '',
    required: false,
  })
  phrase?: string

  @codeGen('11042')
  @ApiProperty({
    description: '',
    required: false,
  })
  sentence?: string

  @codeGen('11043')
  @ApiProperty({
    description: '',
    required: false,
  })
  voice?: string

  @codeGen('11044')
  @ApiProperty({
    description: '',
    required: false,
  })
  audio?: string

  @codeGen('11045')
  @ApiProperty({
    description: '',
    required: false,
  })
  @Transform(getTransformer('numberTransformer'))
  speed?: number
}

export class FindAllPhraseSentenceRequestDTO extends PagingRequestDTO {
  @codeGen('11041')
  @ApiProperty({
    description: '',
    required: false,
  })
  phrase?: string

  @codeGen('11042')
  @ApiProperty({
    description: '',
    required: false,
  })
  sentence?: string

  @codeGen('11043')
  @ApiProperty({
    description: '',
    required: false,
  })
  voice?: string

  @codeGen('11044')
  @ApiProperty({
    description: '',
    required: false,
  })
  audio?: string

  @codeGen('11045')
  @ApiProperty({
    description: '',
    required: false,
  })
  @Transform(getTransformer('numberTransformer'))
  speed?: number
}
