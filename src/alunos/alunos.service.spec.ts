import { Test, TestingModule } from '@nestjs/testing';
import { AlunosRepository } from './alunos.repository.js';
import { AlunosService } from './alunos.service.js';

describe('AlunosService', () => {
  let service: AlunosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlunosService,
        { provide: AlunosRepository, useValue: {} },
      ],
    }).compile();

    service = module.get<AlunosService>(AlunosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
