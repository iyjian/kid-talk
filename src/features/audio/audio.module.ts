import { Module } from '@nestjs/common';
import { AudioService } from './audio.service';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [EventEmitterModule.forRoot()],
  providers: [AudioService],
})
export class AudioModule {}
