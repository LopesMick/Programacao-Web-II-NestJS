import { PartialType } from '@nestjs/mapped-types';
import { CreateAlunoDto } from './create-aluno.dto.js';

// skipNullProperties: false → campo ausente é ignorado, mas null é validado (e rejeitado)
export class PatchAlunoDto extends PartialType(CreateAlunoDto, {
  skipNullProperties: false,
}) {}
