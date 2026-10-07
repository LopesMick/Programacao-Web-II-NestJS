import { Injectable } from '@nestjs/common';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { DatabaseService } from '../database/database.service.js';
import { CreateAlunoDto } from './dto/create-aluno.dto.js';
import { PatchAlunoDto } from './dto/patch-aluno.dto.js';
import { UpdateAlunoDto } from './dto/update-aluno.dto.js';

export interface AlunoRow extends RowDataPacket {
  id: number;
  nome: string;
  email: string;
  curso: string;
}

@Injectable()
export class AlunosRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async findAll() {
    const [rows] = await this.databaseService.execute<AlunoRow[]>(
      `SELECT id, nome, email, curso
       FROM alunos
       ORDER BY id`,
    );

    return rows;
  }

  async findById(id: number) {
    const [rows] = await this.databaseService.execute<AlunoRow[]>(
      `SELECT id, nome, email, curso
       FROM alunos
       WHERE id = ?`,
      [id],
    );

    return rows[0] ?? null;
  }

  async create(data: CreateAlunoDto) {
    const [result] = await this.databaseService.execute<ResultSetHeader>(
      `INSERT INTO alunos (
         nome,
         email,
         curso
       )
       VALUES (?, ?, ?)`,
      [data.nome, data.email, data.curso],
    );

    return result.insertId;
  }

  async update(id: number, data: UpdateAlunoDto) {
    await this.databaseService.execute<ResultSetHeader>(
      `UPDATE alunos
       SET
         nome = ?,
         email = ?,
         curso = ?
       WHERE id = ?`,
      [data.nome, data.email, data.curso, id],
    );
  }

  async patch(id: number, data: PatchAlunoDto) {
    // Os nomes das colunas são fixos no código; só os valores vêm do cliente
    const campos: string[] = [];
    const valores: string[] = [];

    if (data.nome !== undefined) {
      campos.push('nome = ?');
      valores.push(data.nome);
    }

    if (data.email !== undefined) {
      campos.push('email = ?');
      valores.push(data.email);
    }

    if (data.curso !== undefined) {
      campos.push('curso = ?');
      valores.push(data.curso);
    }

    if (campos.length === 0) {
      return;
    }

    await this.databaseService.execute<ResultSetHeader>(
      `UPDATE alunos
       SET ${campos.join(', ')}
       WHERE id = ?`,
      [...valores, id],
    );
  }

  async delete(id: number) {
    await this.databaseService.execute<ResultSetHeader>(
      `DELETE FROM alunos
       WHERE id = ?`,
      [id],
    );
  }
}
