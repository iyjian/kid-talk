import { Test, TestingModule } from '@nestjs/testing';
import { BaiduSpeechService } from './baidu.speech.service';
import { ConfigModule } from '@nestjs/config';
import fs from 'fs';
import path from 'path';
import conf from '../../config';

describe('AudioService', () => {
  let service: BaiduSpeechService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [conf],
        }),
      ],
      providers: [BaiduSpeechService],
    }).compile();

    service = module.get<BaiduSpeechService>(BaiduSpeechService);
  });

  it('speech2text should be reconized as hello whats your name', async () => {
    const buf = fs.readFileSync(
      path.join(__dirname, './../../../testData/test2.wav'),
    );
    const result = await service.speech2Text(buf);
    expect(result.result[0]).toBe("hello what's your name");
  });

  it('text2speech should generate audio', async () => {
    const result = await service.text2Speech('hello world');
    expect(result.toString('base64')).toBe(
      '//MoxAAMKPKcp0IYAIBKBvoRoczPnRZNGchHiQQhQol/393PBgbI8RxfqctYDf7VmwQOP+Xd/zn7/T/+j0K/ozygHKv+/E7t//MoxAoPMWLAAYIwABDK1maMfod2vfpoGmUQMUHj/4Zjx54WqPpV//93/u9pGweCzn6w2YO4cQVX+p9mQeHgQv//vD/boBvM//MoxAgPIU68Ac9YAKaPvGvm6kVF38DV6soAcBpN9bWttqNf8JXUOqWxzUXF+7+YdDr/OryIgKgVXWh7nd/SJVja+x08eE3g//MoxAYNiUq4AKNUcFpxPs6K9kABJU71WTYOMCqXmVyRsJA0+2UEz36jf+5g0qfYxTEIEcJ+pvs1SfHM9NX9IqDhBJA6IifX//MoxAoPiSa4AITacPUDaRomk/SWEESVNkUElrY6EyJ6lK6kSSJWtSF1KWMIaJppeZG78sjyXlvu5UGP9bvb7PQq+tA+OQBj//MoxAYM8P68AJPOcGAI5V3vfzskBqBaTUxb6tiC+HymITtdDoqAc7dzpQFwv6HPU0anjuW2///zfkL7qJUaQF9C7n+9nqpT//MoxA0QKRa8AJYOcK2zGFlTiwuKV6leZR7Trk9nA12NcFgkL9DPerqNybtQ9CAjiW/KO//+aI+JHbff/1dXkE0CquSW20C2//MoxAcO6RcaXlNKcoH6EIgwyMu2udDhHmqztjFCwfu8qgCL/oJB8XfVccDnepcRHP4jMf//yGsNghp8t/zH7bNS/Y3G0CdA//MoxAYMUNbEAJ4OcOjIBe/fftxh2gf+f3T5d/lhkSTdXM+/OBcz/qCxxwIMLDn/9///+uuS9HrqAasdttAAtoH8wcyCWRpv//MoxA8M8NsOXmvQcuffE5ICvYp8f+0ZSl8tf/yo0ROfpVZgGun/////1epv+sJf/6YdC1f//gf8AdDUYsZgkKcL7hdOP345//MoxBYNQN7mXmvOcI8lXAvit85YF3Mu1bCsSW52xMSAm1Rb///+Z/6QLxQF+KtA3IoLEAh4exadiZz81JyG1MBg4HLQTCI0//MoxBwL4JacyKZYTP9GTAnHJunvVosWxhURB4vkQl6KE/Q5giQ4ABksG5+9ZxOJNZNXk8CkRJZypGMVHB4r7y/u7crmmRoj//MoxCcLmLK4wKZwT78Szf4c7UE11ou6gNEA9Rm1HTZYL5EjzPHAaKmK6X5rqOGZBfFG6eppVxgau82DMRnJm9DDOH4idBvt//MoxDMNcL60AJZwTbqOqQFAAUJIAIAB//7xxGzpZrK9/DN9Ze6vfKfH0dqNcWM0FkW85FWn273ZXIa0xLpDVggPBu51Nfbj//MoxDgPkN7eXnvYcOp/////UhXd0pASfgf8ATOtrhadWhPTccaO/LS9LqW011+rDakPkaNDNZa0k5pIi4DIsMKj7GWvp8M3//MoxDQPsO76XmGScP///3uQu//nvRStpIRgM2i0AD8+XOoU6zqGYjZb2BmolMd5DphgLREVh7/c4qkpyatWw/t7mJGMx5S///MoxDANMPrmP0ZAAP//uTchlOWUleVKcsFdBFFtUqmXIGgCnbIyGrILIM0kw/IJyjdHyfiW4GMoikPCGoV1Cg61GLqr9w2q//MoxDYW4RaoAY94AGjV+oVrxc62qD/Z4r+kKepHtDgOmv6ouHKPe3yOA3IOfZ/b7i6VxEwnuT+OJoTpuPMY6VLmaSiJQwhu//MoxBUR6WKwAY9oAA7y+PwyiRGsex4e5sXD6JdRoqRPMmtP7PWq600U36n1L06m/+ZpC5Dk//pSQ/6iXKP8mo4iDqZ3UNTy//MoxAgNcPKIAZg4APCJRirtWkFXJf6m/xqDkRJrd0EY7/c1TU/+lHGurvFQACv5ZSkf+Iqms//+JarRe6BIPG4lmDUHvCgQ//MoxA0QEwK4AYcQAdLblIBuhjF+yBiylp/KOykP//dkBLLt//dpD9P///smx9P9f//55UVlFuxHDv6HDPBSSWqa9i4lAkAM//MoxAcOqq5YAcwQAQBA1PeaXLlz1q1nLWtaxf+hn1KX/////mAgISyG//////1KU1Slb////+tDOoCAlRWR35UIaUBpppVC//MoxAcJUATw0AhGAUrTDEf//VVVEHsVVVU002//////X5VVVTTT6hWmmlVMQU1FMy45OS5MQU1FMy45OS41VVVVVVVVVVVV//MoxBwAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy45OS41VVVVVVVVVVVV//MoxFcAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy45OS41VVVVVVVVVVVV//MoxJIAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//MoxMQAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//MoxMQAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//MoxMQAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV',
    );
  });
});
