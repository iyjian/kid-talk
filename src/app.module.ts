import { CacheModule, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AudioModule } from './features/audio/audio.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OpenaiModule } from './features/openai/openai.module';
import redisStore from 'cache-manager-ioredis';
import { SequelizeModule } from '@nestjs/sequelize';
import { ChatrepoModule } from './features/chatrepo/chatrepo.module';
import conf from './config';
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [conf],
      isGlobal: true,
    }),
    CacheModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get('redis.host'),
        port: +configService.get<number>('redis.port'),
        password: configService.get('redis.password'),
        db: +configService.get<number>('redis.db'),
        ttl: 0,
      }),
      inject: [ConfigService],
      isGlobal: true,
    }),
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        dialect: 'mysql',
        host: configService.get('mysql.host'),
        port: +configService.get<number>('mysql.port'),
        username: configService.get('mysql.username'),
        password: configService.get('mysql.password'),
        database: configService.get('mysql.db'),
        models: [],
        autoLoadModels: true,
        synchronize: true,
        pool: {
          max: 100,
          min: 0,
          idle: 10000,
        },
        timezone: '+08:00',
        logging:
          configService.get<string>('sqlLogging') === 'true' ? true : false,
      }),
      inject: [ConfigService],
    }),
    AudioModule,
    OpenaiModule,
    ChatrepoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
