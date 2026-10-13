import { Injectable, NotFoundException } from '@nestjs/common';
import { CursosRepository } from './cursos.repository.js';

@Injectable()
export class CursosService {
  constructor(
    private readonly cursosRepository: CursosRepository,
  ) {}

  findAll() {
    return this.cursosRepository.findAll();
  }

  async findById(id: number) {
    const curso = await this.cursosRepository.findById(id);

    if (!curso) {
      throw new NotFoundException(
        'Curso não encontrado',
      );
    }

    return curso;
  }
}
