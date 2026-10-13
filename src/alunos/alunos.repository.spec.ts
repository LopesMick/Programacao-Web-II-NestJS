import { PrismaService } from '../prisma/prisma.service.js';
import { Prisma } from '../generated/prisma/client.js';
import { AlunosRepository } from './alunos.repository.js';

describe('AlunosRepository', () => {
  let findMany: ReturnType<typeof vi.fn>;
  let create: ReturnType<typeof vi.fn>;
  let repository: AlunosRepository;

  beforeEach(() => {
    findMany = vi.fn().mockResolvedValue([]);
    create = vi.fn().mockResolvedValue({ id: 1 });
    const prisma = { aluno: { findMany, create } } as unknown as PrismaService;
    repository = new AlunosRepository(prisma);
  });

  it('sem parâmetros lista todos ordenados por id, sem paginar', async () => {
    await repository.findAll();

    expect(findMany).toHaveBeenCalledWith({
      where: {},
      orderBy: { id: 'asc' },
      select: { id: true, nome: true, email: true, curso: true },
    });
  });

  it('filtra por curso e pesquisa por nome com contains', async () => {
    await repository.findAll({ curso: 'ADS', nome: 'Ana' });

    expect(findMany).toHaveBeenCalledWith({
      where: { curso: 'ADS', nome: { contains: 'Ana' } },
      orderBy: { id: 'asc' },
      select: { id: true, nome: true, email: true, curso: true },
    });
  });

  it('pagina com skip = (page - 1) * limit', async () => {
    await repository.findAll({ page: 3, limit: 10 });

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 20, take: 10 }),
    );
  });

  it('usa page 1 e limit 10 quando só um deles é informado', async () => {
    await repository.findAll({ page: 2 });
    expect(findMany).toHaveBeenLastCalledWith(
      expect.objectContaining({ skip: 10, take: 10 }),
    );

    await repository.findAll({ limit: 5 });
    expect(findMany).toHaveBeenLastCalledWith(
      expect.objectContaining({ skip: 0, take: 5 }),
    );
  });

  it('liga o aluno ao curso pelo nome com connectOrCreate', async () => {
    const id = await repository.create({
      nome: 'Ana',
      email: 'ana@email.com',
      curso: 'ADS',
    });

    expect(id).toBe(1);
    expect(create).toHaveBeenCalledWith({
      data: {
        nome: 'Ana',
        email: 'ana@email.com',
        curso: 'ADS',
        cursoRef: {
          connectOrCreate: {
            where: { nome: 'ADS' },
            create: { nome: 'ADS' },
          },
        },
      },
    });
  });

  it('repete uma vez quando outro cadastro cria o mesmo curso', async () => {
    create.mockRejectedValueOnce(
      new Prisma.PrismaClientKnownRequestError('Conflito de curso', {
        code: 'P2002',
        meta: { target: ['nome'] },
        clientVersion: '7.10.0',
      }),
    );
    await expect(
      repository.create({
        nome: 'Ana',
        email: 'ana@example.com',
        curso: 'ADS',
      }),
    ).resolves.toBe(1);
    expect(create).toHaveBeenCalledTimes(2);
  });

  it('não repete cadastro com e-mail duplicado', async () => {
    const error = new Prisma.PrismaClientKnownRequestError(
      'Conflito de e-mail',
      {
        code: 'P2002',
        meta: { target: ['email'] },
        clientVersion: '7.10.0',
      },
    );
    create.mockRejectedValue(error);
    await expect(
      repository.create({
        nome: 'Ana',
        email: 'ana@example.com',
        curso: 'ADS',
      }),
    ).rejects.toBe(error);
    expect(create).toHaveBeenCalledTimes(1);
  });
});
