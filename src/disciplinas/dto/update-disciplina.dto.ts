import {
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateDisciplinaDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nome: string;

  @IsInt()
  @Min(1)
  carga_horaria: number;
}
