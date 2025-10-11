// ============================================
// DTOs DEL SISTEMA DE SUSCRIPCIONES
// ============================================

import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsEmail,
  IsDateString,
  IsArray,
  IsNumber,
  Min,
  Max,
  Length,
  IsUrl,
  ArrayMaxSize,
} from 'class-validator';
import {
  EstadoSolicitudComision,
  EstadoSuscripcionFactura,
  TipoPagoSuscripcion,
} from '../interfaces/suscripciones.interface';

// ============================================
// DTOs PARA CONFIGURACIÓN DE SUSCRIPCIÓN
// ============================================

export class ConfiguracionSuscripcionDto {
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0.01, { message: 'La comisión debe ser mayor a 0.01%' })
  @Max(50, { message: 'La comisión no puede superar el 50%' })
  porcentajeComision: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0, { message: 'La comisión mínima no puede ser negativa' })
  comisionMinima?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0, { message: 'La comisión máxima no puede ser negativa' })
  comisionMaxima?: number;

  @IsOptional()
  @IsInt()
  @Min(1, { message: 'El día debe ser entre 1 y 28' })
  @Max(28, { message: 'El día debe ser entre 1 y 28' })
  diaGeneracionFactura?: number;

  @IsOptional()
  @IsInt()
  @Min(1, { message: 'Debe tener al menos 1 día de vencimiento' })
  @Max(90, { message: 'No puede exceder 90 días de vencimiento' })
  diasVencimientoFactura?: number;

  @IsOptional()
  @IsBoolean()
  incluyeIVA?: boolean;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0, { message: 'El IVA no puede ser negativo' })
  @Max(100, { message: 'El IVA no puede superar el 100%' })
  porcentajeIVA?: number;

  @IsOptional()
  @IsString()
  @Length(0, 500, { message: 'Las observaciones no pueden exceder 500 caracteres' })
  observaciones?: string;
}

export class ActualizarConfiguracionSuscripcionDto extends ConfiguracionSuscripcionDto {
  @IsOptional()
  @IsString()
  @Length(1, 200, { message: 'El motivo debe tener entre 1 y 200 caracteres' })
  motivoCambio?: string;
}

// ============================================
// DTOs PARA SOLICITUD DE CAMBIO DE COMISIÓN
// ============================================

export class SolicitudCambioComisionDto {
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0.01, { message: 'La comisión debe ser mayor a 0.01%' })
  @Max(50, { message: 'La comisión no puede superar el 50%' })
  porcentajeComisionSolicitado: number;

  @IsString()
  @Length(5, 100, { message: 'El motivo debe tener entre 5 y 100 caracteres' })
  motivo: string;

  @IsOptional()
  @IsString()
  @Length(0, 1000, { message: 'La justificación no puede exceder 1000 caracteres' })
  justificacion?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5, { message: 'No se pueden adjuntar más de 5 documentos' })
  @IsUrl({}, { each: true, message: 'Cada adjunto debe ser una URL válida' })
  documentosAdjuntos?: string[];

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0, { message: 'El volumen no puede ser negativo' })
  volumenMensualPromedio?: number;

  @IsOptional()
  @IsInt()
  @Min(1, { message: 'Debe tener al menos 1 pago promedio' })
  cantidadPagosPromedio?: number;

  @IsOptional()
  @IsInt()
  @Min(1, { message: 'Debe tener al menos 1 mes como cliente' })
  tiempoComoCiente?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0, { message: 'La proyección no puede ser negativa' })
  @Max(1000, { message: 'La proyección no puede superar el 1000%' })
  proyeccionCrecimiento?: number;
}

export class ResponderSolicitudComisionDto {
  @IsEnum([EstadoSolicitudComision.APROBADA, EstadoSolicitudComision.RECHAZADA], {
    message: 'El estado debe ser APROBADA o RECHAZADA',
  })
  estado: EstadoSolicitudComision.APROBADA | EstadoSolicitudComision.RECHAZADA;

  @IsString()
  @Length(5, 500, { message: 'La respuesta debe tener entre 5 y 500 caracteres' })
  respuestaSuperAdmin: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0.01, { message: 'La comisión debe ser mayor a 0.01%' })
  @Max(50, { message: 'La comisión no puede superar el 50%' })
  porcentajeComisionAprobado?: number;

  @IsOptional()
  @IsDateString({}, { message: 'Debe ser una fecha válida en formato ISO' })
  fechaInicioNuevaComision?: string;
}

// ============================================
// DTOs PARA FACTURAS DE SUSCRIPCIÓN
// ============================================

export class GenerarFacturaDto {
  @IsInt()
  @Min(1, { message: 'El mes debe ser entre 1 y 12' })
  @Max(12, { message: 'El mes debe ser entre 1 y 12' })
  mes: number;

  @IsInt()
  @Min(2020, { message: 'El año debe ser mayor a 2020' })
  @Max(2050, { message: 'El año no puede ser mayor a 2050' })
  anio: number;

  @IsOptional()
  @IsBoolean()
  forzarRegeneracion?: boolean;
}

export class AprobarFacturaDto {
  @IsOptional()
  @IsString()
  @Length(0, 200, { message: 'Las observaciones no pueden exceder 200 caracteres' })
  observaciones?: string;
}

export class MarcarFacturaPagadaDto {
  @IsEnum(TipoPagoSuscripcion, {
    message: 'El tipo de pago debe ser SISTEMA o EXTERNO',
  })
  tipoPago: TipoPagoSuscripcion;

  @IsOptional()
  @IsString()
  @Length(1, 100, { message: 'La referencia debe tener entre 1 y 100 caracteres' })
  referenciaPago?: string;

  @IsOptional()
  @IsString()
  @Length(0, 200, { message: 'Las observaciones no pueden exceder 200 caracteres' })
  observacionesPago?: string;
}

// ============================================
// DTOs PARA DATOS BANCARIOS
// ============================================

export class ConfiguracionDatosBancariosDto {
  @IsString()
  @Length(2, 100, { message: 'El nombre de cuenta debe tener entre 2 y 100 caracteres' })
  nombreCuenta: string;

  @IsString()
  @Length(2, 100, { message: 'El nombre del banco debe tener entre 2 y 100 caracteres' })
  nombreBanco: string;

  @IsString()
  @Length(22, 22, { message: 'El CBU debe tener exactamente 22 dígitos' })
  cbu: string;

  @IsOptional()
  @IsString()
  @Length(6, 20, { message: 'El alias debe tener entre 6 y 20 caracteres' })
  alias?: string;

  @IsOptional()
  @IsString()
  @Length(1, 20, { message: 'El número de cuenta no puede exceder 20 caracteres' })
  numeroCuenta?: string;

  @IsOptional()
  @IsString()
  @Length(1, 50, { message: 'El tipo de cuenta no puede exceder 50 caracteres' })
  tipoCuenta?: string;

  @IsOptional()
  @IsString()
  @Length(1, 100, { message: 'La sucursal no puede exceder 100 caracteres' })
  sucursal?: string;

  @IsString()
  @Length(2, 100, { message: 'La razón social debe tener entre 2 y 100 caracteres' })
  razonSocialTitular: string;

  @IsString()
  @Length(11, 13, { message: 'El CUIT debe tener entre 11 y 13 caracteres' })
  cuitTitular: string;

  @IsString()
  @Length(5, 200, { message: 'El domicilio fiscal debe tener entre 5 y 200 caracteres' })
  domicilioFiscal: string;

  @IsOptional()
  @IsBoolean()
  esPrincipal?: boolean;

  @IsOptional()
  @IsString()
  @Length(0, 500, { message: 'Las instrucciones no pueden exceder 500 caracteres' })
  instruccionesPago?: string;

  @IsOptional()
  @IsString()
  @Length(0, 100, { message: 'El horario no puede exceder 100 caracteres' })
  horarioAtencion?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Debe ser un email válido' })
  emailContacto?: string;

  @IsOptional()
  @IsString()
  @Length(1, 20, { message: 'El teléfono no puede exceder 20 caracteres' })
  telefonoContacto?: string;
}

// ============================================
// DTOs PARA CONSULTAS Y FILTROS
// ============================================

export class FiltroFacturasDto {
  @IsOptional()
  @IsEnum(EstadoSuscripcionFactura, {
    message: 'Estado de factura inválido',
  })
  estado?: EstadoSuscripcionFactura;

  @IsOptional()
  @IsInt()
  @Min(2020)
  @Max(2050)
  anio?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  mes?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}

export class FiltroSolicitudesDto {
  @IsOptional()
  @IsEnum(EstadoSolicitudComision, {
    message: 'Estado de solicitud inválido',
  })
  estado?: EstadoSolicitudComision;

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}

export class RangoFechasDto {
  @IsDateString({}, { message: 'La fecha de inicio debe ser válida' })
  fechaInicio: string;

  @IsDateString({}, { message: 'La fecha de fin debe ser válida' })
  fechaFin: string;
}