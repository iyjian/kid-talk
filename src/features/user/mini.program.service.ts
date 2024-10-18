import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import http from 'axios'

@Injectable()
export class MiniProgramService {
  constructor(private readonly configService: ConfigService) {}

  async authorization(code: string, encryptedData?: string, iv?: string) {
    const pkg = await this.getSessionKey(code)

    const { openid: openId, session_key } = pkg

    return openId
  }

  /**
   * 获取微信会话密钥
   *
   * @param code 微信小程序登录时获取的 code
   * @returns 返回从微信服务器获取的会话密钥信息，包括 openid、session_key 等
   * @throws 如果请求失败或响应数据不符合预期，将抛出错误
   */
  async getSessionKey(code: string) {
    const response = await http({
      url: 'https://api.weixin.qq.com/sns/jscode2session',
      method: 'GET',
      params: {
        appid: this.configService.get('wx.appId'),
        secret: this.configService.get('wx.appSecret'),
        js_code: code,
        grant_type: 'authorization_code',
      },
    })

    const res = response.data

    if (res.errcode || !res.openid || !res.session_key) {
      // debug('%s: %O', ERRORS.ERR_GET_SESSION_KEY, res.errmsg)
      console.log(res.errmsg)
      throw new Error(res.errmsg)
    } else {
      console.log('openid: %s, session_key: %s', res.openid, res.session_key)
      return res
    }
  }
}
