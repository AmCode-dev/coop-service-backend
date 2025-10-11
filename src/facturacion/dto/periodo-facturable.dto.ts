import {
  IsString,
  IsOptional,
  IsEnum,
  IsDecimal,
  IsBoolean,
  IsInt,
  IsUUID,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { EstadoPeriodo } from '../../../generated/prisma';

export class CreatePeriodoFacturableDto {
  @IsInt()
  @Min(1)
  @Max(12)
  mes: number;

  @IsInt()
  @Min(2020)
  @Max(2050)
  anio: number;

  @Type(() => Date)
  fechaInicio: Date;

  @Type(() => Date)
  fechaFin: Date;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  observaciones?: string;
}

export class UpdatePeriodoFacturableDto {
  @IsOptional()
  @Type(() => Date)
  fechaInicio?: Date;

  @IsOptional()
  @Type(() => Date)
  fechaFin?: Date;

  @IsOptional()
  @IsEnum(EstadoPeriodo)
  estado?: EstadoPeriodo;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  observaciones?: string;

  @IsOptional()
  @Type(() => Date)
  fechaCierre?: Date;
}

export class CreateConceptoFacturableAplicadoDto {
  @IsDecimal({ decimal_digits: '0,4' })
  @Transform(({ value }) => (typeof value === 'string' ? value : String(value)))
  cantidad: string;

  @IsDecimal({ decimal_digits: '0,4' })
  @Transform(({ value }) => (typeof value === 'string' ? value : String(value)))
  valorUnitario: string;

  @IsOptional()
  @IsBoolean()
  aplicaIVA?: boolean;

  @IsOptional()
  @IsDecimal({ decimal_digits: '0,2' })
  @Transform(({ value }) => (typeof value === 'string' ? value : String(value)))
  porcentajeIVA?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  observaciones?: string;

  @IsUUID()
  periodoId: string;

  @IsUUID()
  conceptoId: string;

  @IsUUID()
  cuentaId: string;

  @IsOptional()
  @IsUUID()
  cuentaServicioId?: string;
}

export class UpdateConceptoFacturableAplicadoDto {
  @IsOptional()
  @IsDecimal({ decimal_digits: '0,4' })
  @Transform(({ value }) => (typeof value === 'string' ? value : String(value)))
  cantidad?: string;

  @IsOptional()
  @IsDecimal({ decimal_digits: '0,4' })
  @Transform(({ value }) => (typeof value === 'string' ? value : String(value)))
  valorUnitario?: string;

  @IsOptional()
  @IsBoolean()
  aplicaIVA?: boolean;

  @IsOptional()
  @IsDecimal({ decimal_digits: '0,2' })
  @Transform(({ value }) => (typeof value === 'string' ? value : String(value)))
  porcentajeIVA?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  observaciones?: string;

  @IsOptional()
  @IsBoolean()
  facturado?: boolean;
}

export class PeriodoFacturableQueryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  @Transform(({ value }) => parseInt(value))
  mes?: number;

  @IsOptional()
  @IsInt()
  @Min(2020)
  @Max(2050)
  @Transform(({ value }) => parseInt(value))
  anio?: number;

  @IsOptional()
  @IsEnum(EstadoPeriodo)
  estado?: EstadoPeriodo;
}

export class ConceptoAplicadoQueryDto {
  @IsOptional()
  @IsUUID()
  periodoId?: string;

  @IsOptional()
  @IsUUID()
  conceptoId?: string;

  @IsOptional()
  @IsUUID()
  cuentaId?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  includeFacturados?: boolean = false;
}

export class BulkCreateConceptosAplicadosDto {
  @IsUUID()
  periodoId: string;

  @IsUUID()
  conceptoId: string;

  @IsDecimal({ decimal_digits: '0,4' })
  @Transform(({ value }) => (typeof value === 'string' ? value : String(value)))
  valorUnitario: string;

  @IsOptional()
  @IsBoolean()
  aplicaIVA?: boolean;

  @IsOptional()
  @IsDecimal({ decimal_digits: '0,2' })
  @Transform(({ value }) => (typeof value === 'string' ? value : String(value)))
  porcentajeIVA?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  observaciones?: string;

  cuentasConceptos: Array<{
    cuentaId: string;
    cuentaServicioId?: string;
    cantidad: string;
  }>;
}

export class CalcularFacturacionDto {
  @IsUUID()
  periodoId: string;

  @IsOptional()
  @IsUUID()
  cuentaId?: string;
}

export class ResumenFacturacionDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  @Transform(({ value }) => parseInt(value))
  mes?: number;

  @IsOptional()
  @IsInt()
  @Min(2020)
  @Max(2050)
  @Transform(({ value }) => parseInt(value))
  anio?: number;
}