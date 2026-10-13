import { Injectable } from '@nestjs/common';
import { Disciplina } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateDisciplinaDto } from './dto/create-disciplina.dto.js';
import { UpdateDisciplinaDto } from './dto/update-disciplina.dto.js';

// No Prisma o campo é cargaHoraria; a API continua respondendo carga_horaria
function toResponse(disciplina: Disciplina) {
  return {
    id: disciplina.id,
    nome: disciplina.nome,
    carga_horaria: disciplina.cargaHoraria,
  };
}

@Injectable()
export class DisciplinasRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const disciplinas = await this.prisma.disciplina.findMany({
      orderBy: { id: 'asc' },
    });

    return disciplinas.map(toResponse);
  }

  async findById(id: number) {
    const disciplina = await this.prisma.disciplina.findUnique({
      where: { id },
    });

    return disciplina ? toResponse(disciplina) : null;
  }

  async create(data: CreateDisciplinaDto) {
    const disciplina = await this.prisma.disciplina.create({
      data: {
        nome: data.nome,
        cargaHoraria: data.carga_horaria,
      },
    });

    return disciplina.id;
  }

  async update(id: number, data: UpdateDisciplinaDto) {
    await this.prisma.disciplina.update({
      where: { id },
      data: {
        nome: data.nome,
        cargaHoraria: data.carga_horaria,
      },
    });
  }

  async delete(id: number) {
    await this.prisma.disciplina.delete({
      where: { id },
    });
  }
}
