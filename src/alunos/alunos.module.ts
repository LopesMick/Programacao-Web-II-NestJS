import { Module } from '@nestjs/common';
import { AlunosController } from './alunos.controller.js';
import { AlunosRepository } from './alunos.repository.js';
import { AlunosService } from './alunos.service.js';

@Module({
  controllers: [AlunosController],
  providers: [AlunosService, AlunosRepository],
})
export class AlunosModule {}
