import { ValidationPipe, type INestApplication } from '@nestjs/common';

export function configurarValidacao(app: INestApplication) {
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
}
