import { Test, TestingModule } from '@nestjs/testing';
import { ProfessoresController } from './professores.controller.js';
import { ProfessoresService } from './professores.service.js';

describe('ProfessoresController', () => {
  let controller: ProfessoresController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfessoresController],
      providers: [ProfessoresService],
    }).compile();

    controller = module.get<ProfessoresController>(ProfessoresController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
