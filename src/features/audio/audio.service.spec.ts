import { Test, TestingModule } from '@nestjs/testing';
import { AudioService } from './audio.service';
import { ConfigModule } from '@nestjs/config';

describe('AudioService', () => {
  let service: AudioService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [
            () => ({
              kdxf: {
                appId: process.env.KDXF_APP_ID,
                apiSecret: 'secretxxxxxxxx2df7900c09xxxxxxxx',
                apiKey: 'keyxxxxxxxx8ee279348519exxxxxxxx',
              },
            }),
          ],
        }),
      ],
      providers: [AudioService],
    }).compile();

    service = module.get<AudioService>(AudioService);
  });

  it('should be defined', () => {
    const authorization = service.getAuthorization(
      'iat-api.xfyun.cn',
      'Wed, 10 Jul 2019 07:35:43 GMT',
    );
    expect(authorization).toBe(
      'YXBpX2tleT0ia2V5eHh4eHh4eHg4ZWUyNzkzNDg1MTlleHh4eHh4eHgiLCBhbGdvcml0aG09ImhtYWMtc2hhMjU2IiwgaGVhZGVycz0iaG9zdCBkYXRlIHJlcXVlc3QtbGluZSIsIHNpZ25hdHVyZT0iSHAzVHk0WmtTQm1MOGpLeU9McFFpdjlTcjVudm1lWUVIN1dzTC9aTzJKZz0i',
    );
  });
});
