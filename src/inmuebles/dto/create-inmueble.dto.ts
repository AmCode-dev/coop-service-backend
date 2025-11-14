import { IsString, IsOptional, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateInmuebleDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  domicilio: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  piso?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  codigoPostal: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  localidad: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  departamento?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  provincia: string;

  // Datos Catastrales (opcionales)
  @IsOptional()
  @IsString()
  @MaxLength(50)
  seccion?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  chacra?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  manzana?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  lote?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  parcela?: string;

  @IsString()
  @IsNotEmpty()
  titularInmuebleId?: string | null;
}
