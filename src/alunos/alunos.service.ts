import { Injectable } from '@nestjs/common';
import { AlunosRepository } from './alunos.repository.js';

@Injectable()
export class AlunosService {
  constructor(
    private readonly alunosRepository: AlunosRepository,
  ) {}

  findAll() {
    return this.alunosRepository.findAll();
  }

  findById(id: number) {
    return this.alunosRepository.findById(id);
  }

  create(nome: string, email: string, curso: string) {
    return this.alunosRepository.create(nome, email, curso);
  }

  update(
    id: number,
    nome: string,
    email: string,
    curso: string,
  ) {
    return this.alunosRepository.update(id, nome, email, curso);
  }

  delete(id: number) {
    return this.alunosRepository.delete(id);
  }
}
