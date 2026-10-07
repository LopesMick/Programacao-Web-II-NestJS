import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AlunosModule } from './alunos/alunos.module.js';
import { ProfessoresModule } from './professores/professores.module.js';
import { DatabaseModule } from './database/database.module.js';
import { DisciplinasModule } from './disciplinas/disciplinas.module.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Distributed tracing, auto-correlated logs, request/job metrics, error
    // telemetry, alarms, and more — out of the box. Sign up at https://observe.nestjs.com
    ObserveModule.forRoot({
      appKey: 'YOUR_APP_KEY',
      appSecret: 'YOUR_APP_SECRET',
      serviceId: 'meu-projeto',
    }),
    AlunosModule,
    ProfessoresModule,
    DatabaseModule,
    DisciplinasModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
