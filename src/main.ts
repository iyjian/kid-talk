import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { NestExpressApplication } from '@nestjs/platform-express'
import { join } from 'path'
import { ApiGuard } from './core/api.guard'
import { ConfigService } from '@nestjs/config'
import { WsAdapter } from '@nestjs/platform-ws'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)
  app.useWebSocketAdapter(new WsAdapter(app));
  app.useGlobalGuards(new ApiGuard(app.get(ConfigService)))
  app.setBaseViewsDir(join(__dirname, '..', 'views'))
  app.setViewEngine('hbs')
  app.enableCors()
  await app.listen(3000)
}
bootstrap()
