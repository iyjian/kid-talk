import { Test, TestingModule } from '@nestjs/testing'
import { OpenaiService } from './openai.service'
import { ConfigModule, ConfigService } from '@nestjs/config'
import fs from 'fs'
import path from 'path'
import conf from './../../config'

describe('OpenaiService', () => {
  let service: OpenaiService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [conf],
        }),
      ],
      providers: [OpenaiService],
    }).compile()

    service = module.get<OpenaiService>(OpenaiService)
  })

  it('should chat with AI', async () => {
    const result = await service.chat([
      {
        role: 'user',
        content: 'just say "hello",all characters in lowwer case',
      },
    ])
    expect(result.choices[0].message.content).toBe('hello')
  })

  it('should speech2text using file', async () => {
    const result = await service.speech2Text(
      fs.createReadStream(
        path.join(__dirname, './../../../testData/test2.wav'),
      ),
    )

    expect(result).toBe(`Hello, what's your name?`)
  })

  it('should create speech from text', async () => {
    const result = await service.createSpeech(
      {
        model: 'tts',
        input: 'hello',
        voice: 'echo',
        response_format: 'wav',
      },
      {},
    )
    require('fs').writeFileSync('./test.wav', result)
    expect(result.toString('base64').substring(0, 1)).toBe('U')
  })
})
