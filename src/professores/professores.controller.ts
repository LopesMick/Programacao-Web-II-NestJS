import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { ProfessoresService } from './professores.service.js';

@Controller('professores')
export class ProfessoresController {
  constructor(
    private readonly professoresService: ProfessoresService,
  ) {}

  @Get()
  findAll() {
    return this.professoresService.findAll();
  }

  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.professoresService.findById(id);
  }

  @Post()
  create(
    @Body() body: {
      nome: string;
      disciplina: string;
    },
  ) {
    return this.professoresService.create(
      body.nome,
      body.disciplina,
    );
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: {
      nome: string;
      disciplina: string;
    },
  ) {
    return this.professoresService.update(
      id,
      body.nome,
      body.disciplina,
    );
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.professoresService.delete(id);
  }
}
