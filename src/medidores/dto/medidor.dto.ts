import { IsString, IsOptional, IsDateString, IsBoolean, IsUUID } from 'class-validator';

export class CreateMedidorDto {
  @IsString()
  numeroMedidor: string;

  @IsOptional()
  @IsString()
  marca?: string;

  @IsOptional()
  @IsString()
  modelo?: string;

  @IsOptional()
  @IsDateString()
  fechaInstalacion?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsOptional()
  @IsUUID()
  inmuebleId?: string; // Ubicación del medidor
}

export class UpdateMedidorDto {
  @IsOptional()
  @IsString()
  numeroMedidor?: string;

  @IsOptional()
  @IsString()
  marca?: string;

  @IsOptional()
  @IsString()
  modelo?: string;

  @IsOptional()
  @IsDateString()
  fechaInstalacion?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsOptional()
  @IsUUID()
  inmuebleId?: string;
}

export class VincularMedidorDto {
  @IsUUID()
  medidorId: string;

  @IsUUID()
  entidadId: string; // ID del inmueble o cuenta servicio

  @IsString()
  tipoVinculacion: 'INMUEBLE' | 'CUENTA_SERVICIO';

  @IsOptional()
  @IsString()
  motivo?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;
}

export class DesvincularMedidorDto {
  @IsString()
  motivo: string;

  @IsOptional()
  @IsString()
  observaciones?: string;
}