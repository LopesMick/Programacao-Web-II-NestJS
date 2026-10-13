import { Injectable } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { violouUnicidade } from '../prisma/prisma-errors.js';
import { CreateAlunoDto } from './dto/create-aluno.dto.js';
import { ListAlunosQueryDto } from './dto/list-alunos-query.dto.js';
import { PatchAlunoDto } from './dto/patch-aluno.dto.js';
import { UpdateAlunoDto } from './dto/update-aluno.dto.js';

const LIMITE_PADRAO = 10;
const alunoSelect = { id: true, nome: true, email: true, curso: true } as const;

function conectarCurso(nome: string) {
  return {
    connectOrCreate: {
      where: { nome },
      create: { nome },
    },
  };
}

@Injectable()
export class AlunosRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(query: ListAlunosQueryDto = {}) {
    const where: Prisma.AlunoWhereInput = {};

    if (query.curso !== undefined) {
      where.curso = query.curso;
    }

    if (query.nome !== undefined) {
      where.nome = { contains: query.nome };
    }

    // Sem page e sem limit, devolve todos os registros, como antes
    const paginar = query.page !== undefined || query.limit !== undefined;
    const page = query.page ?? 1;
    const limit = query.limit ?? LIMITE_PADRAO;

    return this.prisma.aluno.findMany({
      where,
      select: alunoSelect,
      orderBy: { id: 'asc' },
      ...(paginar && {
        skip: (page - 1) * limit,
        take: limit,
      }),
    });
  }

  findById(id: number) {
    return this.prisma.aluno.findUnique({
      where: { id },
      select: alunoSelect,
    });
  }

  async create(data: CreateAlunoDto) {
    const aluno = await this.salvar(() =>
      this.prisma.aluno.create({
        data: {
          nome: data.nome,
          email: data.email,
          curso: data.curso,
          cursoRef: conectarCurso(data.curso),
        },
      }),
    );

    return aluno.id;
  }

  async update(id: number, data: UpdateAlunoDto) {
    await this.salvar(() =>
      this.prisma.aluno.update({
        where: { id },
        data: {
          nome: data.nome,
          email: data.email,
          curso: data.curso,
          cursoRef: conectarCurso(data.curso),
        },
      }),
    );
  }

  async patch(id: number, data: PatchAlunoDto) {
    await this.salvar(() =>
      this.prisma.aluno.update({
        where: { id },
        data: {
          nome: data.nome,
          email: data.email,
          curso: data.curso,
          ...(data.curso !== undefined && {
            cursoRef: conectarCurso(data.curso),
          }),
        },
      }),
    );
  }

  async delete(id: number) {
    await this.prisma.aluno.delete({
      where: { id },
    });
  }

  private async salvar<T>(operacao: () => Promise<T>) {
    try {
      return await operacao();
    } catch (error) {
      // Outro cadastro pode criar o mesmo curso entre a busca e a inserção.
      if (violouUnicidade(error, 'nome')) return operacao();
      throw error;
    }
  }
}
