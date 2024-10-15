import { Test, TestingModule } from '@nestjs/testing'
import { BaiduSpeechService } from './baidu.speech.service'
import { ConfigModule } from '@nestjs/config'
import fs from 'fs'
import path from 'path'
import conf from '../../config'

describe('AudioService', () => {
  let service: BaiduSpeechService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [conf],
        }),
      ],
      providers: [BaiduSpeechService],
    }).compile()

    service = module.get<BaiduSpeechService>(BaiduSpeechService)
  })

  it('speech2text should be reconized as hello whats your name', async () => {
    const buf = fs.readFileSync(
      path.join(__dirname, './../../../testData/test2.wav'),
    )
    const result = await service.speech2Text(buf)
    console.log(result)
    expect(result.result[0]).toBe("hello what's your name")
  })

  // it('text2speech should generate audio', async () => {
  //   const result = await service.text2Speech('hello world')
  //   expect(result.toString('base64').substring(0, 2)).toBe('//')
  // })
})
