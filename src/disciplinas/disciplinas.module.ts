import { Module } from '@nestjs/common';
import { DisciplinasController } from './disciplinas.controller.js';
import { DisciplinasRepository } from './disciplinas.repository.js';
import { DisciplinasService } from './disciplinas.service.js';

@Module({
  controllers: [DisciplinasController],
  providers: [DisciplinasService, DisciplinasRepository],
})
export class DisciplinasModule {}
