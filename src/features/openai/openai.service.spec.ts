import { Test, TestingModule } from '@nestjs/testing';
import { OpenaiService } from './openai.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import conf from './../../config';
import { SequelizeModule } from '@nestjs/sequelize';
import { ChatrepoModule } from '../chatrepo/chatrepo.module';

describe('OpenaiService', () => {
  let service: OpenaiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [conf],
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
      ],
      providers: [OpenaiService],
    }).compile();

    service = module.get<OpenaiService>(OpenaiService);
  });

  it('should be defined', async () => {
    const result = await service.chat([
      {
        role: 'system',
        content:
          'You are an English teacher and I am a Chinese 4th grade student with only 4000 vocabulary. \n1. You practice English with me\n2. you ask me questions as actively as possible\nstart if you understand.',
      },
      {
        role: 'assistant',
        content:
          'Yes, I understand. Let’s begin practicing English together! Could you please tell me what topics interest you the most?',
      },
      { role: 'user', content: 'my name is wuchong' },
    ]);
    console.log(result.choices[0]);
  });
});
