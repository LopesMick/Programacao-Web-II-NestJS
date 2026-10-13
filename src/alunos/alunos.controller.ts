import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { AlunosService } from './alunos.service.js';
import { CreateAlunoDto } from './dto/create-aluno.dto.js';
import { ListAlunosQueryDto } from './dto/list-alunos-query.dto.js';
import { PatchAlunoDto } from './dto/patch-aluno.dto.js';
import { UpdateAlunoDto } from './dto/update-aluno.dto.js';

@Controller('alunos')
export class AlunosController {
  constructor(
    private readonly alunosService: AlunosService,
  ) {}

  // Filtros e paginação opcionais: ?curso=ADS&nome=Ana&page=1&limit=10
  @Get()
  findAll(@Query() query: ListAlunosQueryDto) {
    return this.alunosService.findAll(query);
  }

  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.alunosService.findById(id);
  }

  @Post()
  create(@Body() data: CreateAlunoDto) {
    return this.alunosService.create(data);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateAlunoDto,
  ) {
    return this.alunosService.update(id, data);
  }

  @Patch(':id')
  patch(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: PatchAlunoDto,
  ) {
    return this.alunosService.patch(id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.alunosService.delete(id);
  }
}
