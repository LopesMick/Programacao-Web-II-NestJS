import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module.js';
import { AlunosController } from './alunos.controller.js';
import { AlunosRepository } from './alunos.repository.js';
import { AlunosService } from './alunos.service.js';

@Module({
  imports: [DatabaseModule],
  controllers: [AlunosController],
  providers: [AlunosService, AlunosRepository],
})
export class AlunosModule {}
