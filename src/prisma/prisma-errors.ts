import { ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';

export function violouUnicidade(error: unknown, campo: 'email' | 'nome') {
  if (
    !(error instanceof Prisma.PrismaClientKnownRequestError) ||
    error.code !== 'P2002'
  ) {
    return false;
  }
  const target = error.meta?.target;
  const adapter = error.meta?.driverAdapterError as
    | {
        cause?: { constraint?: { fields?: string[]; index?: string } };
      }
    | undefined;
  const constraint = adapter?.cause?.constraint;
  const names: unknown[] = [
    ...(Array.isArray(target) ? target : [target]),
    ...(constraint?.fields ?? []),
    constraint?.index,
  ];
  const index = campo === 'email' ? 'alunos_email_key' : 'cursos_nome_key';
  return names.some((name) => name === campo || name === index);
}

export async function executarOperacao<T>(
  operacao: Promise<T>,
  naoEncontrado: string,
) {
  try {
    return await operacao;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') throw new NotFoundException(naoEncontrado);
      if (error.code === 'P2002') {
        if (violouUnicidade(error, 'email')) {
          throw new ConflictException('Já existe um aluno com este e-mail');
        }
        if (violouUnicidade(error, 'nome')) {
          throw new ConflictException('Já existe um curso com este nome');
        }
        throw new ConflictException('Já existe um registro com estes dados');
      }
    }
    throw error;
  }
}
