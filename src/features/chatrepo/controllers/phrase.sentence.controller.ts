import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import {
  FindAllPhraseSentenceRequestDTO,
  CreatePhraseSentenceRequestDTO,
  UpdatePhraseSentenceRequestDTO,
} from './../dto/phrase.sentence.request.dto'
import { PhraseSentenceService } from './../services/phrase.sentence.service'
import {
  ApiPaginatedResponse,
  ApiFindOneResponse,
  ApiPatchResponse,
  ApiDeleteResponse,
  codeGen,
} from './../../../core'
import {
  FindOneResponseSchema,
  FindAllResponseSchema,
} from './../dto/phrase.sentence.response.schema'

@Controller('phraseSentence')
@ApiTags('t_phrase_sentence')
export class PhraseSentenceController {
  constructor(private readonly phraseSentenceService: PhraseSentenceService) {}

  @Post('')
  @ApiOperation({
    summary: 'POST phraseSentence',
  })
  @ApiFindOneResponse('phraseSentence', FindOneResponseSchema)
  @codeGen('841-create')
  create(@Body() createPhraseSentence: CreatePhraseSentenceRequestDTO) {
    return this.phraseSentenceService.create(createPhraseSentence)
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'PATCH phraseSentence',
  })
  @ApiPatchResponse('phraseSentence')
  @codeGen('841-update')
  update(
    @Param('id') id: string,
    @Body() updatePhraseSentenceRequestDTO: UpdatePhraseSentenceRequestDTO,
  ) {
    return this.phraseSentenceService.updateById(
      +id,
      updatePhraseSentenceRequestDTO,
    )
  }

  @Get('')
  @ApiOperation({
    summary: 'GET phraseSentence(list)',
  })
  @ApiPaginatedResponse('phraseSentence', FindAllResponseSchema)
  @codeGen('841-findAll')
  findAll(
    @Query() findAllQueryPhraseSentence: FindAllPhraseSentenceRequestDTO,
  ) {
    return this.phraseSentenceService.findAll(findAllQueryPhraseSentence)
  }

  @Get(':id')
  @ApiOperation({
    summary: 'GET phraseSentence(single)',
  })
  @ApiFindOneResponse('phraseSentence', FindOneResponseSchema)
  @codeGen('841-findOne')
  findOne(@Param('id') id: string) {
    return this.phraseSentenceService.findOneByIdOrThrow(+id)
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'DELETE phraseSentence',
  })
  @ApiDeleteResponse('phraseSentence')
  @codeGen('841-remove')
  remove(@Param('id') id: string) {
    return this.phraseSentenceService.removeById(+id)
  }
}
