import { Module } from '@nestjs/common';
import { CursosController } from './cursos.controller.js';
import { CursosRepository } from './cursos.repository.js';
import { CursosService } from './cursos.service.js';

@Module({
  controllers: [CursosController],
  providers: [CursosService, CursosRepository],
})
export class CursosModule {}
