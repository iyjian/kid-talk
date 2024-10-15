import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthingUser } from './authing.user.entity';
import { AuthingUserService } from './authing.user.service';
import { MiniProgramService } from './mini.program.service';
import { AuthingUserController } from './authing.user.controller';

@Module({
    imports:[
        SequelizeModule.forFeature([AuthingUser]),
    ],
    controllers: [AuthingUserController],
    providers: [AuthingUserService, MiniProgramService],
    exports: [AuthingUserService],

})
export class UserModule {}
