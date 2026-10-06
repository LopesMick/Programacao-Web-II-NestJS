import { Test, TestingModule } from '@nestjs/testing';
import { AlunosController } from './alunos.controller.js';
import { AlunosRepository } from './alunos.repository.js';
import { AlunosService } from './alunos.service.js';

describe('AlunosController', () => {
  let controller: AlunosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AlunosController],
      providers: [
        AlunosService,
        { provide: AlunosRepository, useValue: {} },
      ],
    }).compile();

    controller = module.get<AlunosController>(AlunosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
