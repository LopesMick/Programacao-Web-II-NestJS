import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class CursosRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.curso.findMany({
      orderBy: { id: 'asc' },
      include: { _count: { select: { alunos: true } } },
    });
  }

  findById(id: number) {
    return this.prisma.curso.findUnique({
      where: { id },
      include: {
        alunos: {
          select: { id: true, nome: true, email: true },
          orderBy: { id: 'asc' },
        },
      },
    });
  }
}
