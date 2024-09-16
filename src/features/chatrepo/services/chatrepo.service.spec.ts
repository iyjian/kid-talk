import { Test, TestingModule } from '@nestjs/testing'
import { ChatrepoService } from './chatrepo.service'

describe('ChatrepoService', () => {
  let service: ChatrepoService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatrepoService],
    }).compile()

    service = module.get<ChatrepoService>(ChatrepoService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
