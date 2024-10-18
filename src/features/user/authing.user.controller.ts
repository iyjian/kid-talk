import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Headers,
  Request,
  Req,
} from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'

import { AuthingUserService } from './authing.user.service'
import { ReqUserId } from './../../core'

@Controller('user')
@ApiTags('用户表')
export class AuthingUserController {
  constructor(private readonly userService: AuthingUserService) {}

  // const {
  //   'x-wx-code': code,
  //   'x-wx-encrypted-data': encryptedData,
  //   'x-wx-iv': iv,
  // } = req.headers
  @Post('login')
  login(@Body('code') code: string) {
    //   const {
    //   'x-wx-code': code,
    //   'x-wx-encrypted-data': encryptedData,
    //   'x-wx-iv': iv,
    // } = headers
    return this.userService.login(code)
  }

  @Get('detail')
  @ApiOperation({
    summary: '获取登录信息',
  })
  getLoginInfo(@ReqUserId('userId') userId: number) {
    return this.userService.findOneById(userId)
  }

  @Get('')
  @ApiOperation({
    summary: 'GET user(list)',
  })
  findAll(@Query() findAllQueryUser: any) {
    return this.userService.findAll(findAllQueryUser)
  }
}
