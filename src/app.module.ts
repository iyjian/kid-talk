import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AudioModule } from './features/audio/audio.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import conf from './config';
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [conf],
      isGlobal: true,
    }),
    AudioModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
