import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateAlunoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nome: string;

  @IsEmail()
  @IsNotEmpty()
  @MaxLength(150)
  email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  curso: string;
}
