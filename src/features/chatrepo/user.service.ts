import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User)
    private readonly UserModel: typeof User,
  ) {}

  findOneByUid(uid: string) {
    return this.UserModel.findOne({
      where: {
        uid,
      },
    });
  }
}
