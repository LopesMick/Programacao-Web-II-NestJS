import { Injectable } from '@nestjs/common';

@Injectable()
export class ProfessoresService {
  private professores = [
    {
      id: 1,
      nome: 'Roberto',
      disciplina: 'Programação Web II',
    },
    {
      id: 2,
      nome: 'Juliana',
      disciplina: 'Banco de Dados',
    },
  ];

  // Contador que só aumenta: evita ids repetidos depois de um DELETE
  private proximoId = 3;

  findAll() {
    return this.professores;
  }

  findById(id: number) {
    return this.professores.find(
      (professor) => professor.id === id,
    );
  }

  create(nome: string, disciplina: string) {
    const novoProfessor = {
      id: this.proximoId++,
      nome,
      disciplina,
    };

    this.professores.push(novoProfessor);

    return novoProfessor;
  }

  update(
    id: number,
    nome: string,
    disciplina: string,
  ) {
    const professor = this.professores.find(
      (professor) => professor.id === id,
    );

    if (!professor) {
      return null;
    }

    professor.nome = nome;
    professor.disciplina = disciplina;

    return professor;
  }

  delete(id: number) {
    const index = this.professores.findIndex(
      (professor) => professor.id === id,
    );

    if (index === -1) {
      return false;
    }

    this.professores.splice(index, 1);

    return true;
  }
}
