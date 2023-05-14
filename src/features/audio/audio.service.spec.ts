import { Test, TestingModule } from '@nestjs/testing';
import { AudioService } from './audio.service';
import { ConfigModule } from '@nestjs/config';
import fs from 'fs';
import path from 'path';
import conf from './../../config';

describe('AudioService', () => {
  let service: AudioService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [conf],
        }),
      ],
      providers: [AudioService],
    }).compile();

    service = module.get<AudioService>(AudioService);
  });

  it('should be defined', async () => {
    const buf = fs.readFileSync(
      path.join(__dirname, './../../../testData/test2.wav'),
    );
    console.log(buf);
    const result = await service.handleSpeech2Text(buf);
    console.log(result);
  });
});
