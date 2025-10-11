import {
  IsOptional,
  IsBoolean,
  IsEnum,
  IsString,
  IsDateString,
} from 'class-validator';
import { Transform } from 'class-transformer';

// Enums locales para evitar dependencias circulares
enum MotivoTransferencia {
  COMPRAVENTA = 'COMPRAVENTA',
  DONACION = 'DONACION',
  HERENCIA = 'HERENCIA',
  DIVORCIO = 'DIVORCIO',
  CESION_DERECHOS = 'CESION_DERECHOS',
  ADJUDICACION_JUDICIAL = 'ADJUDICACION_JUDICIAL',
  RESTITUCION = 'RESTITUCION',
  CAMBIO_DATOS = 'CAMBIO_DATOS',
  SUBDIVISION = 'SUBDIVISION',
  UNIFICACION = 'UNIFICACION',
  OTRO = 'OTRO',
}

export class InmuebleFilterDto {
  @IsOptional()
  @IsString()
  search?: string; // Búsqueda general por domicilio, localidad, etc.

  @IsOptional()
  @IsString()
  localidad?: string;

  @IsOptional()
  @IsString()
  provincia?: string;

  @IsOptional()
  @IsString()
  titularId?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  activo?: boolean;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  limit?: number = 20;

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}

export class TransferenciaTitularidadDto {
  @IsString()
  titularNuevoId: string;

  @IsEnum(MotivoTransferencia)
  motivo: MotivoTransferencia;

  @IsOptional()
  @IsString()
  descripcionMotivo?: string;

  @IsOptional()
  @IsDateString()
  fechaTransferencia?: string;

  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  valorTransferencia?: number;

  @IsOptional()
  @IsString()
  moneda?: string;

  @IsOptional()
  @IsString()
  escribania?: string;

  @IsOptional()
  @IsString()
  numeroEscritura?: string;

  @IsOptional()
  @IsString()
  folioRegistro?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;
}

export class AsociarCuentaDto {
  @IsString()
  cuentaId: string;
}

export class DeshabilitarInmuebleDto {
  @IsOptional()
  @IsString()
  motivo?: string;
}