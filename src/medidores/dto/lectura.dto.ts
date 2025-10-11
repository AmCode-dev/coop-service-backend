import {
  IsString,
  IsOptional,
  IsDateString,
  IsBoolean,
  IsUUID,
  IsNumber,
  IsDecimal,
  Min,
  Max,
} from 'class-validator';

export class CreateLecturaDto {
  @IsUUID()
  medidorId: string;

  @IsDateString()
  fechaLectura: string;

  @IsDecimal()
  valorLectura: string; // Como string para validaciones de decimales

  @IsOptional()
  @IsDecimal()
  lecturaAnterior?: string;

  @IsNumber()
  @Min(1)
  @Max(12)
  mes: number;

  @IsNumber()
  @Min(2020)
  anio: number;

  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsOptional()
  @IsBoolean()
  esPrincipal?: boolean;
}

export class UpdateLecturaDto {
  @IsOptional()
  @IsDateString()
  fechaLectura?: string;

  @IsOptional()
  @IsDecimal()
  valorLectura?: string;

  @IsOptional()
  @IsDecimal()
  lecturaAnterior?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(12)
  mes?: number;

  @IsOptional()
  @IsNumber()
  @Min(2020)
  anio?: number;

  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsOptional()
  @IsBoolean()
  esPrincipal?: boolean;

  @IsOptional()
  @IsBoolean()
  anomalia?: boolean;

  @IsOptional()
  @IsString()
  tipoAnomalia?: string;
}

export class BuscarLecturasDto {
  @IsOptional()
  @IsUUID()
  medidorId?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(12)
  mes?: number;

  @IsOptional()
  @IsNumber()
  @Min(2020)
  anio?: number;

  @IsOptional()
  @IsDateString()
  fechaDesde?: string;

  @IsOptional()
  @IsDateString()
  fechaHasta?: string;

  @IsOptional()
  @IsBoolean()
  soloAnomalias?: boolean;

  @IsOptional()
  @IsBoolean()
  soloPrincipales?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(1)
  limite?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  pagina?: number;
}