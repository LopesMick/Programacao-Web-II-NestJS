import { Injectable } from '@nestjs/common';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { DatabaseService } from '../database/database.service.js';
import { CreateDisciplinaDto } from './dto/create-disciplina.dto.js';
import { UpdateDisciplinaDto } from './dto/update-disciplina.dto.js';

export interface DisciplinaRow extends RowDataPacket {
  id: number;
  nome: string;
  carga_horaria: number;
}

@Injectable()
export class DisciplinasRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async findAll() {
    const [rows] = await this.databaseService.execute<DisciplinaRow[]>(
      `SELECT id, nome, carga_horaria
       FROM disciplinas
       ORDER BY id`,
    );

    return rows;
  }

  async findById(id: number) {
    const [rows] = await this.databaseService.execute<DisciplinaRow[]>(
      `SELECT id, nome, carga_horaria
       FROM disciplinas
       WHERE id = ?`,
      [id],
    );

    return rows[0] ?? null;
  }

  async create(data: CreateDisciplinaDto) {
    const [result] = await this.databaseService.execute<ResultSetHeader>(
      `INSERT INTO disciplinas (
         nome,
         carga_horaria
       )
       VALUES (?, ?)`,
      [data.nome, data.carga_horaria],
    );

    return result.insertId;
  }

  async update(id: number, data: UpdateDisciplinaDto) {
    await this.databaseService.execute<ResultSetHeader>(
      `UPDATE disciplinas
       SET
         nome = ?,
         carga_horaria = ?
       WHERE id = ?`,
      [data.nome, data.carga_horaria, id],
    );
  }

  async delete(id: number) {
    await this.databaseService.execute<ResultSetHeader>(
      `DELETE FROM disciplinas
       WHERE id = ?`,
      [id],
    );
  }
}
