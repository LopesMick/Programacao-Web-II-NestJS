import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '../generated/prisma/client.js';
import { AlunosRepository } from './alunos.repository.js';
import { AlunosService } from './alunos.service.js';

describe('AlunosService', () => {
  let service: AlunosService;
  const repository = {
    findById: vi.fn(),
    create: vi.fn(),
  };

  beforeEach(async () => {
    vi.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlunosService,
        { provide: AlunosRepository, useValue: repository },
      ],
    }).compile();

    service = module.get<AlunosService>(AlunosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('lança NotFoundException quando o aluno não existe', async () => {
    repository.findById.mockResolvedValue(null);

    await expect(service.findById(99)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('converte e-mail duplicado (P2002) em ConflictException', async () => {
    repository.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        meta: { target: ['email'] },
        clientVersion: Prisma.prismaVersion.client,
      }),
    );

    await expect(
      service.create({ nome: 'Ana', email: 'bia@email.com', curso: 'ADS' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
