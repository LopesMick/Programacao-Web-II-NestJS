import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { executarOperacao } from '../prisma/prisma-errors.js';
import { AlunosRepository } from './alunos.repository.js';
import { CreateAlunoDto } from './dto/create-aluno.dto.js';
import { ListAlunosQueryDto } from './dto/list-alunos-query.dto.js';
import { PatchAlunoDto } from './dto/patch-aluno.dto.js';
import { UpdateAlunoDto } from './dto/update-aluno.dto.js';

@Injectable()
export class AlunosService {
  constructor(private readonly alunosRepository: AlunosRepository) {}

  findAll(query?: ListAlunosQueryDto) {
    return this.alunosRepository.findAll(query);
  }

  async findById(id: number) {
    const aluno = await this.alunosRepository.findById(id);

    if (!aluno) {
      throw new NotFoundException('Aluno não encontrado');
    }

    return aluno;
  }

  async create(data: CreateAlunoDto) {
    const id = await executarOperacao(
      this.alunosRepository.create(data),
      'Aluno não encontrado',
    );

    return this.findById(id);
  }

  async update(id: number, data: UpdateAlunoDto) {
    await this.findById(id);

    await executarOperacao(
      this.alunosRepository.update(id, data),
      'Aluno não encontrado',
    );

    return this.findById(id);
  }

  async patch(id: number, data: PatchAlunoDto) {
    if (Object.keys(data).length === 0) {
      throw new BadRequestException('Informe ao menos um campo para atualizar');
    }

    await this.findById(id);

    await executarOperacao(
      this.alunosRepository.patch(id, data),
      'Aluno não encontrado',
    );

    return this.findById(id);
  }

  async delete(id: number) {
    await this.findById(id);

    await executarOperacao(
      this.alunosRepository.delete(id),
      'Aluno não encontrado',
    );
  }
}
