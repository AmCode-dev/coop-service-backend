import {
  IsString,
  IsOptional,
  IsNumber,
  IsUUID,
  IsDateString,
  Min,
  Max,
  MaxLength,
} from 'class-validator';

export class CreateHistorialPrecioDto {
  @IsNumber(
    { maxDecimalPlaces: 4 },
    { message: 'El precio base debe ser un número válido con máximo 4 decimales' },
  )
  @Min(0.0001, { message: 'El precio base debe ser mayor a 0' })
  precioBase: number;

  @IsNumber({}, { message: 'El mes debe ser un número entero' })
  @Min(1, { message: 'El mes debe estar entre 1 y 12' })
  @Max(12, { message: 'El mes debe estar entre 1 y 12' })
  mes: number;

  @IsNumber({}, { message: 'El año debe ser un número entero' })
  @Min(2020, { message: 'El año debe ser mayor o igual a 2020' })
  anio: number;

  @IsDateString({}, { message: 'La fecha de vigencia debe ser una fecha válida' })
  vigenciaDesde: string;

  @IsOptional()
  @IsDateString({}, { message: 'La fecha de fin de vigencia debe ser una fecha válida' })
  vigenciaHasta?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Las observaciones no pueden exceder 500 caracteres' })
  observaciones?: string;

  @IsUUID('4', { message: 'El ID de la categoría debe ser un UUID válido' })
  categoriaId: string;
}

export class UpdateHistorialPrecioDto {
  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 4 },
    { message: 'El precio base debe ser un número válido con máximo 4 decimales' },
  )
  @Min(0.0001, { message: 'El precio base debe ser mayor a 0' })
  precioBase?: number;

  @IsOptional()
  @IsDateString({}, { message: 'La fecha de fin de vigencia debe ser una fecha válida' })
  vigenciaHasta?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Las observaciones no pueden exceder 500 caracteres' })
  observaciones?: string;
}

export class BuscarPreciosDto {
  @IsOptional()
  @IsNumber({}, { message: 'El mes debe ser un número entero' })
  @Min(1, { message: 'El mes debe estar entre 1 y 12' })
  @Max(12, { message: 'El mes debe estar entre 1 y 12' })
  mes?: number;

  @IsOptional()
  @IsNumber({}, { message: 'El año debe ser un número entero' })
  @Min(2020, { message: 'El año debe ser mayor o igual a 2020' })
  anio?: number;

  @IsOptional()
  @IsDateString({}, { message: 'La fecha desde debe ser una fecha válida' })
  fechaDesde?: string;

  @IsOptional()
  @IsDateString({}, { message: 'La fecha hasta debe ser una fecha válida' })
  fechaHasta?: string;
}