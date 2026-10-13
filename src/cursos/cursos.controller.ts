import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { CursosService } from './cursos.service.js';

// Somente leitura: os cursos são criados automaticamente ao cadastrar alunos
@Controller('cursos')
export class CursosController {
  constructor(
    private readonly cursosService: CursosService,
  ) {}

  @Get()
  findAll() {
    return this.cursosService.findAll();
  }

  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.cursosService.findById(id);
  }
}
