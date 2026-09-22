import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
} from 'class-validator';

export class CreateSalaDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  nome: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  setor: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  nfcTagId?: string;
}
