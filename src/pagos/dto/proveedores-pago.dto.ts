import {
  IsString,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsArray,
  IsObject,
  IsUrl,
  IsEmail,
  IsDateString,
  Min,
  Max,
  Length,
  IsJSON,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { TipoProveedorPago, EstadoProveedorPago } from '../interfaces/proveedores-pago.interface';

// ============================================
// DTOs PARA PROVEEDORES DE PAGO
// ============================================

export class CrearProveedorPagoDto {
  @IsString()
  @Length(1, 100)
  nombre: string;

  @IsString()
  @Length(1, 50)
  codigo: string;

  @IsEnum(TipoProveedorPago)
  tipo: TipoProveedorPago;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  descripcion?: string;

  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @IsOptional()
  @IsUrl()
  sitioWeb?: string;

  @IsOptional()
  @IsUrl()
  apiBaseUrl?: string;

  @IsOptional()
  @IsString()
  versionApi?: string;

  @IsOptional()
  @IsUrl()
  documentacionUrl?: string;

  @IsOptional()
  @IsBoolean()
  soportaWebhooks?: boolean = false;

  @IsOptional()
  @IsBoolean()
  soportaTarjetas?: boolean = true;

  @IsOptional()
  @IsBoolean()
  soportaTransferencias?: boolean = false;

  @IsOptional()
  @IsBoolean()
  soportaEfectivo?: boolean = false;

  @IsOptional()
  @IsBoolean()
  soportaRecurrentes?: boolean = false;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  montoMinimo?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  montoMaximo?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  @Max(100)
  comisionPorcentaje?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  comisionFija?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1440) // máximo 24 horas
  tiempoExpiracionMinutos?: number = 60;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(168) // máximo 7 días
  tiempoConfirmacionHoras?: number = 72;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  paisesDisponibles?: string[] = [];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  monedasSoportadas?: string[] = ['ARS'];

  @IsOptional()
  @IsEnum(EstadoProveedorPago)
  estado?: EstadoProveedorPago = EstadoProveedorPago.ACTIVO;

  @IsOptional()
  @IsBoolean()
  activo?: boolean = true;
}

export class ActualizarProveedorPagoDto {
  @IsOptional()
  @IsString()
  @Length(1, 100)
  nombre?: string;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  descripcion?: string;

  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @IsOptional()
  @IsUrl()
  sitioWeb?: string;

  @IsOptional()
  @IsUrl()
  apiBaseUrl?: string;

  @IsOptional()
  @IsString()
  versionApi?: string;

  @IsOptional()
  @IsUrl()
  documentacionUrl?: string;

  @IsOptional()
  @IsBoolean()
  soportaWebhooks?: boolean;

  @IsOptional()
  @IsBoolean()
  soportaTarjetas?: boolean;

  @IsOptional()
  @IsBoolean()
  soportaTransferencias?: boolean;

  @IsOptional()
  @IsBoolean()
  soportaEfectivo?: boolean;

  @IsOptional()
  @IsBoolean()
  soportaRecurrentes?: boolean;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  montoMinimo?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  montoMaximo?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  @Max(100)
  comisionPorcentaje?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  comisionFija?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1440)
  tiempoExpiracionMinutos?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(168)
  tiempoConfirmacionHoras?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  paisesDisponibles?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  monedasSoportadas?: string[];

  @IsOptional()
  @IsEnum(EstadoProveedorPago)
  estado?: EstadoProveedorPago;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}

// ============================================
// DTOs PARA CONFIGURACIÓN DE COOPERATIVAS
// ============================================

export class ConfigurarProveedorCooperativaDto {
  @IsString()
  proveedorPagoId: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean = true;

  @IsOptional()
  @IsBoolean()
  esPrincipal?: boolean = false;

  @IsString()
  @Length(1, 500)
  tokenAcceso: string;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  tokenRefresh?: string;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  clavePublica?: string;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  clavePrivada?: string;

  @IsOptional()
  @IsBoolean()
  entornoPruebas?: boolean = true;

  @IsOptional()
  @IsUrl()
  webhookUrl?: string;

  @IsOptional()
  @IsString()
  @Length(0, 200)
  webhookSecret?: string;

  @IsOptional()
  @IsObject()
  configuracionPersonalizada?: Record<string, any>;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  montoMinimo?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  montoMaximo?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  @Max(100)
  comisionAdicional?: number;
}

export class ActualizarProveedorCooperativaDto {
  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @IsOptional()
  @IsBoolean()
  esPrincipal?: boolean;

  @IsOptional()
  @IsString()
  @Length(1, 500)
  tokenAcceso?: string;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  tokenRefresh?: string;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  clavePublica?: string;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  clavePrivada?: string;

  @IsOptional()
  @IsBoolean()
  entornoPruebas?: boolean;

  @IsOptional()
  @IsUrl()
  webhookUrl?: string;

  @IsOptional()
  @IsString()
  @Length(0, 200)
  webhookSecret?: string;

  @IsOptional()
  @IsObject()
  configuracionPersonalizada?: Record<string, any>;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  montoMinimo?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  montoMaximo?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0)
  @Max(100)
  comisionAdicional?: number;
}

// ============================================
// DTOs PARA SOLICITUDES DE PAGO EXTERNAS
// ============================================

export class CrearSolicitudPagoExternaDto {
  @IsString()
  facturaId: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  monto: number;

  @IsString()
  @Length(1, 200)
  descripcion: string;

  @IsOptional()
  @IsEmail()
  emailPagador?: string;

  @IsOptional()
  @IsString()
  @Length(0, 20)
  telefonoPagador?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  metodosPermitidos?: string[];

  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => new Date(value))
  fechaExpiracion?: Date;

  @IsOptional()
  @IsUrl()
  urlExito?: string;

  @IsOptional()
  @IsUrl()
  urlError?: string;

  @IsOptional()
  @IsUrl()
  urlPendiente?: string;

  @IsOptional()
  @IsUrl()
  urlWebhook?: string;

  @IsOptional()
  @IsString()
  @Length(0, 100)
  referencia?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

// ============================================
// DTOs PARA WEBHOOKS
// ============================================

export class ProcesarWebhookDto {
  @IsEnum(TipoProveedorPago)
  proveedorTipo: TipoProveedorPago;

  @IsString()
  idTransaccionExterna: string;

  @IsString()
  estado: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  monto?: number;

  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => new Date(value))
  fechaPago?: Date;

  @IsOptional()
  @IsString()
  metodoPago?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  comision?: number;

  @IsObject()
  respuestaCompleta: Record<string, any>;

  @IsOptional()
  @IsString()
  firma?: string;
}

// ============================================
// DTOs PARA CONSULTAS Y FILTROS
// ============================================

export class BuscarProveedoresDto {
  @IsOptional()
  @IsEnum(TipoProveedorPago)
  tipo?: TipoProveedorPago;

  @IsOptional()
  @IsEnum(EstadoProveedorPago)
  estado?: EstadoProveedorPago;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  activo?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  soportaWebhooks?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  soportaTarjetas?: boolean;

  @IsOptional()
  @IsString()
  busqueda?: string; // Búsqueda por nombre o código

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  pagina?: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limite?: number = 20;

  @IsOptional()
  @IsString()
  ordenarPor?: string = 'nombre';

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  direccion?: 'asc' | 'desc' = 'asc';
}

export class ConsultarEstadisticasProveedorDto {
  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => new Date(value))
  fechaDesde?: Date;

  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => new Date(value))
  fechaHasta?: Date;

  @IsOptional()
  @IsEnum(['dia', 'semana', 'mes', 'anio'])
  agrupacion?: 'dia' | 'semana' | 'mes' | 'anio' = 'mes';

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  incluirComisiones?: boolean = false;
}

// ============================================
// DTOs DE RESPUESTA
// ============================================

export class RespuestaProveedorPagoDto {
  id: string;
  nombre: string;
  codigo: string;
  tipo: TipoProveedorPago;
  descripcion?: string;
  logoUrl?: string;
  sitioWeb?: string;
  soportaWebhooks: boolean;
  soportaTarjetas: boolean;
  soportaTransferencias: boolean;
  soportaEfectivo: boolean;
  soportaRecurrentes: boolean;
  montoMinimo?: number;
  montoMaximo?: number;
  estado: EstadoProveedorPago;
  activo: boolean;
  paisesDisponibles: string[];
  monedasSoportadas: string[];
  createdAt: Date;
  updatedAt: Date;
}

export class RespuestaProveedorCooperativaDto {
  id: string;
  activo: boolean;
  esPrincipal: boolean;
  entornoPruebas: boolean;
  estadoConexion: string;
  fechaIntegracion: Date;
  fechaUltimaConexion?: Date;
  totalTransacciones: number;
  montoTotalProcesado: number;
  ultimaTransaccion?: Date;
  proveedor?: RespuestaProveedorPagoDto;
  // Nota: Los tokens y claves no se incluyen en la respuesta por seguridad
}

export class RespuestaSolicitudPagoExternaDto {
  exito: boolean;
  idTransaccionExterna?: string;
  urlPago?: string;
  qrCode?: string;
  codigoBarras?: string;
  estado?: string;
  mensaje?: string;
  fechaExpiracion?: Date;
  metadata?: Record<string, any>;
  error?: {
    codigo: string;
    mensaje: string;
    detalles?: Record<string, any>;
  };
}