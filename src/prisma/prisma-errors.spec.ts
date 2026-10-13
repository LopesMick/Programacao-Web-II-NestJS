import { ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';
import { executarOperacao, violouUnicidade } from './prisma-errors.js';

const erro = (code: string, meta?: Record<string, unknown>) =>
  new Prisma.PrismaClientKnownRequestError('Falha de persistência', {
    code,
    meta,
    clientVersion: '7.10.0',
  });

describe('Erros Prisma', () => {
  it.each([
    [['email'], 'Já existe um aluno com este e-mail'],
    [['nome'], 'Já existe um curso com este nome'],
    [['desconhecido'], 'Já existe um registro com estes dados'],
  ])('distingue a constraint %s', async (target, message) => {
    await expect(
      executarOperacao(
        Promise.reject(erro('P2002', { target })),
        'Aluno não encontrado',
      ),
    ).rejects.toMatchObject({ message, status: 409 });
  });

  it('reconhece o índice informado pelo driver sem interpretar o valor duplicado', async () => {
    const error = erro('P2002', {
      driverAdapterError: {
        cause: {
          constraint: { index: 'cursos_nome_key' },
          originalMessage: "Duplicate entry 'email'",
        },
      },
    });
    expect(violouUnicidade(error, 'nome')).toBe(true);
    expect(violouUnicidade(error, 'email')).toBe(false);
    await expect(
      executarOperacao(Promise.reject(error), 'Aluno não encontrado'),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it.each(['Aluno não encontrado', 'Disciplina não encontrada'])(
    'converte P2025 em 404: %s',
    async (message) => {
      await expect(
        executarOperacao(Promise.reject(erro('P2025')), message),
      ).rejects.toBeInstanceOf(NotFoundException);
    },
  );

  it('preserva erros não reconhecidos', async () => {
    const error = new Error('Falha de conexão');
    await expect(
      executarOperacao(Promise.reject(error), 'Aluno não encontrado'),
    ).rejects.toBe(error);
  });
});
