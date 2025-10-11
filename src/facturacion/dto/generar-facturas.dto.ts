import {
  IsString,
  IsOptional,
  IsUUID,
  IsDateString,
  IsArray,
  IsBoolean,
} from 'class-validator';

export class GenerarFacturasPeriodoDto {
  @IsUUID()
  periodoId: string;

  @IsDateString()
  fechaVencimiento: string;

  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  cuentasEspecificas?: string[]; // Si solo quiere generar para ciertas cuentas

  @IsOptional()
  @IsBoolean()
  sobreescribirExistentes?: boolean; // Si ya existen facturas para el período
}

export class GenerarFacturaIndividualDto {
  @IsUUID()
  periodoId: string;

  @IsUUID()
  cuentaId: string;

  @IsDateString()
  fechaVencimiento: string;

  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsOptional()
  @IsBoolean()
  sobreescribirExistente?: boolean;
}

export class ResumenGeneracionFacturasDto {
  @IsUUID()
  periodoId: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  cuentasEspecificas?: string[];
}

export interface ResultadoGeneracionFacturas {
  periodoId: string;
  periodo: string;
  totalCuentas: number;
  facturasGeneradas: number;
  facturasActualizadas: number;
  errores: number;
  facturasCreadas: {
    facturaId: string;
    numeroFactura: string;
    cuentaId: string;
    numeroCuenta: string;
    titularServicio: string;
    total: string;
    totalConceptos: number;
  }[];
  erroresDetalle: {
    cuentaId: string;
    numeroCuenta?: string;
    error: string;
  }[];
}

export interface PreviewFactura {
  cuentaId: string;
  numeroCuenta: string;
  titularServicio: {
    nombre: string;
    apellido: string;
  };
  conceptosAplicados: {
    conceptoId: string;
    nombreConcepto: string;
    cantidad: string;
    valorUnitario: string;
    subtotal: string;
    aplicaIVA: boolean;
    montoIVA: string;
    total: string;
  }[];
  resumenFactura: {
    subtotal: string;
    totalIVA: string;
    total: string;
    totalConceptos: number;
  };
}
