import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module.js';
import { configurarValidacao } from './validation.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  configurarValidacao(app);

  app.enableShutdownHooks();

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);

  await app.listen(port);
}
await bootstrap();
