import { Test, TestingModule } from '@nestjs/testing'
import { OpenaiService } from './openai.service'
import { ConfigModule, ConfigService } from '@nestjs/config'
import fs from 'fs'
import { fs as fs2 } from 'memfs'
import path from 'path'
import conf from './../../config'
// import { Readable } from 'stream'
// import streamifier from 'streamifier'
// import { SequelizeModule } from '@nestjs/sequelize'
// import { ChatrepoModule } from '../chatrepo/chatrepo.module'

// function bufferToStream(buf: Buffer) {
//   const readableStream = new Readable()
//   // readable._read = () => {} // _read is required but you can noop it
//   readableStream.push(buf)
//   readableStream.push(null)
//   // readableStream.pause()
//   // readableStream['fileName'] = 'test.wav'
//   return readableStream
// }

// function bufferToStream(buffer) {
//   const readable = new Readable({
//     read() {
//       this.push(buffer) // 将 Buffer 添加到可读流
//       this.push(null) // 表示流的结束
//     },
//   })
//   return readable
// }

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

  // it('should speech2text using buffer', async () => {
  //   const content = fs.readFileSync(
  //     path.join(__dirname, './../../../testData/test2.wav'),
  //   )

  //   fs2.writeFileSync('/test.wav', content)

  //   // const result = await service.speech2Text(
  //   //   streamifier.createReadStream(content),
  //   // )
  //   // const result = await service.speech2Text(bufferToStream(content))
  //   const result = await service.speech2Text(fs2.createReadStream('/test.wav'))

  //   expect(result).toBe(`Hello, what's your name?`)
  // })
})
