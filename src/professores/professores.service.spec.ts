import { Test, TestingModule } from '@nestjs/testing';
import { ProfessoresService } from './professores.service.js';

describe('ProfessoresService', () => {
  let service: ProfessoresService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProfessoresService],
    }).compile();

    service = module.get<ProfessoresService>(ProfessoresService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
