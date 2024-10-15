import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter'
import { Server, Socket } from 'socket.io'
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayConnection,
  ConnectedSocket,
} from '@nestjs/websockets'
import baiduAIP from 'baidu-aip-sdk'
import fs from 'fs'
import ffmpeg from 'fluent-ffmpeg'
import { Readable } from 'stream'
import path from 'path'

type SPEECH2TEXT_RESULT = {
  corpus_no: string
  err_msg: string
  err_no: number
  result: string[]
  sn: 'string'
}

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
//
export class BaiduSpeechService {
  private readonly logger = new Logger(BaiduSpeechService.name)
  private readonly baiduAIPAccessKey = this.configService.get('baidu.accessKey')
  private readonly baiduAIPAccessSecret =
    this.configService.get('baidu.accessSecret')
  private readonly baiduAIPAppId = this.configService.get('baidu.accessKey')

  private readonly client = new baiduAIP.speech(
    this.baiduAIPAppId,
    this.baiduAIPAccessKey,
    this.baiduAIPAccessSecret,
  )

  constructor(private readonly configService: ConfigService) {}

  /**
   * 文字转语音
   *
   * @param data
   * @param per
   * @param spd
   * @returns
   */
  async text2Speech(
    data: string,
    per: number = 5003,
    spd: number = 5,
  ): Promise<Buffer> {
    // 调用调试工具
    // https://console.bce.baidu.com/tools/?_=1669807341890#/api?product=AI&project=%E8%AF%AD%E9%9F%B3%E6%8A%80%E6%9C%AF&parent=%E8%AF%AD%E9%9F%B3%E5%90%88%E6%88%90&api=text2audio&method=post
    const startTime = +new Date()
    this.logger.debug(`text2speech - start - text: ${data}`)
    const result = await this.client.text2audio(data, {
      // 度逍遥（精品）=5003，度小鹿=5118
      per,
      spd,
      // 3为mp3格式(默认)； 4为pcm-16k；5为pcm-8k；6为wav（内容同pcm-16k）; 注意aue=4或者6是语音识别要求的格式，但是音频内容不是语音识别要求的自然人发音，所以识别效果会受影响。
      aue: 3,
    })
    this.logger.debug(
      `text2speech - end - timing: ${+new Date() - startTime}ms`,
    )

    if (result.err_no) {
      this.logger.debug(result)
      throw new Error(result.err_msg)
    }
    return result.data
  }

  /**
   *
   * @param data - webm的二进制audio数据
   * @returns
   */
  async speech2Text(data: Buffer): Promise<SPEECH2TEXT_RESULT> {
    const startTime = +new Date()
    const transformedFile = path.join(
      __dirname,
      `./tmp/${Math.round(Math.random() * 10000000)}.wav`,
    )

    const readable = new Readable()
    readable._read = () => {} // _read is required but you can noop it
    readable.push(data)
    readable.push(null)

    const stream = fs.createWriteStream(transformedFile)

    /*
     * 把webm转为wav并存储
     */
    await new Promise((resolve, reject) => {
      ffmpeg(readable)
        .format('wav')
        .output(stream, { end: true })
        .outputOptions(['-ar 1', '-ar 16000', '-vn'])
        .on('end', function () {
          resolve(stream)
        })
        .run()
    })

    const result = await this.client.recognize(
      fs.readFileSync(transformedFile),
      'wav',
      16000,
      {
        dev_pid: 1737,
      },
    )
    if (result.err_no) {
      throw new Error(result.err_msg)
    }
    this.logger.debug(`speech2Text - timing: ${+new Date() - startTime}ms`)
    return result
  }
}
