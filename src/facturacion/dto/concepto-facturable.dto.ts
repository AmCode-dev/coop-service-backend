import {
  IsString,
  IsOptional,
  IsEnum,
  IsDecimal,
  IsBoolean,
  MinLength,
  MaxLength,
  IsUUID,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { TipoConcepto, TipoCalculo } from '../../../generated/prisma';

export class CreateConceptoFacturableDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  nombre: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  codigo: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  descripcion?: string;

  @IsEnum(TipoConcepto)
  tipoConcepto: TipoConcepto;

  @IsEnum(TipoCalculo)
  tipoCalculo: TipoCalculo;

  @IsOptional()
  @IsDecimal({ decimal_digits: '0,4' })
  @Transform(({ value }) => value?.toString())
  valorActual?: string;

  @IsOptional()
  @IsBoolean()
  aplicaIVA?: boolean;

  @IsOptional()
  @IsDecimal({ decimal_digits: '0,2' })
  @Transform(({ value }) => value?.toString())
  porcentajeIVA?: string;

  @IsOptional()
  @IsBoolean()
  esConfigurable?: boolean;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}

export class UpdateConceptoFacturableDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  nombre?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  descripcion?: string;

  @IsOptional()
  @IsEnum(TipoConcepto)
  tipoConcepto?: TipoConcepto;

  @IsOptional()
  @IsEnum(TipoCalculo)
  tipoCalculo?: TipoCalculo;

  @IsOptional()
  @IsDecimal({ decimal_digits: '0,4' })
  @Transform(({ value }) => value?.toString())
  valorActual?: string;

  @IsOptional()
  @IsBoolean()
  aplicaIVA?: boolean;

  @IsOptional()
  @IsDecimal({ decimal_digits: '0,2' })
  @Transform(({ value }) => value?.toString())
  porcentajeIVA?: string;

  @IsOptional()
  @IsBoolean()
  esConfigurable?: boolean;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}

export class CreateHistorialConceptoDto {
  @IsDecimal({ decimal_digits: '0,4' })
  @Transform(({ value }) => value?.toString())
  valor: string;

  @Type(() => Date)
  vigenciaDesde: Date;

  @IsOptional()
  @Type(() => Date)
  vigenciaHasta?: Date;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  observaciones?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  motivo?: string;

  @IsUUID()
  conceptoId: string;
}

export class UpdateHistorialConceptoDto {
  @IsOptional()
  @IsDecimal({ decimal_digits: '0,4' })
  @Transform(({ value }) => value?.toString())
  valor?: string;

  @IsOptional()
  @Type(() => Date)
  vigenciaDesde?: Date;

  @IsOptional()
  @Type(() => Date)
  vigenciaHasta?: Date;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  observaciones?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  motivo?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}

export class ConceptoFacturableQueryDto {
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  includeInactive?: boolean = false;

  @IsOptional()
  @IsEnum(TipoConcepto)
  tipoConcepto?: TipoConcepto;

  @IsOptional()
  @IsEnum(TipoCalculo)
  tipoCalculo?: TipoCalculo;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;
}