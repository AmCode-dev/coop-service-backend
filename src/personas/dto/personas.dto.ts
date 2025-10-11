import {
  IsString,
  IsOptional,
  IsEmail,
  IsDateString,
  IsBoolean,
  IsEnum,
  IsUUID,
  IsDecimal,
  IsNumber,
  Min,
  Max,
  Length,
  Matches,
  IsPhoneNumber,
} from 'class-validator';

export class CreatePersonaDto {
  @IsString()
  @Length(2, 100)
  nombreCompleto: string;

  @IsEnum(['DNI', 'CUIL', 'CUIT', 'PASAPORTE', 'CI'])
  tipoDocumento: 'DNI' | 'CUIL' | 'CUIT' | 'PASAPORTE' | 'CI';

  @IsString()
  @Length(6, 20)
  @Matches(/^[0-9]+$/, {
    message: 'El número de documento debe contener solo números',
  })
  numeroDocumento: string;

  @IsEnum([
    'RESPONSABLE_INSCRIPTO',
    'MONOTRIBUTISTA',
    'EXENTO',
    'CONSUMIDOR_FINAL',
    'NO_CATEGORIZADO',
  ])
  @IsOptional()
  categoriaIVA?:
    | 'RESPONSABLE_INSCRIPTO'
    | 'MONOTRIBUTISTA'
    | 'EXENTO'
    | 'CONSUMIDOR_FINAL'
    | 'NO_CATEGORIZADO';

  // Datos Personales
  @IsOptional()
  @IsDateString()
  fechaNacimiento?: string;

  @IsOptional()
  @IsEnum(['SOLTERO', 'CASADO', 'DIVORCIADO', 'VIUDO'])
  estadoCivil?: 'SOLTERO' | 'CASADO' | 'DIVORCIADO' | 'VIUDO';

  @IsOptional()
  @IsString()
  nacionalidad?: string;

  // Contacto
  @IsOptional()
  @IsPhoneNumber('AR')
  telefono?: string;

  @IsOptional()
  @IsPhoneNumber('AR')
  telefonoMovil?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsEmail()
  emailSecundario?: string;

  // Domicilio Actual
  @IsOptional()
  @IsString()
  domicilioActual?: string;

  @IsOptional()
  @IsString()
  pisoActual?: string;

  @IsOptional()
  @IsString()
  codigoPostalActual?: string;

  @IsOptional()
  @IsString()
  localidadActual?: string;

  @IsOptional()
  @IsString()
  departamentoActual?: string;

  @IsOptional()
  @IsString()
  provinciaActual?: string;

  // Domicilio Fiscal (obligatorio)
  @IsString()
  domicilioFiscal: string;

  @IsOptional()
  @IsString()
  pisoFiscal?: string;

  @IsOptional()
  @IsString()
  codigoPostalFiscal?: string;

  @IsString()
  localidadFiscal: string;

  @IsOptional()
  @IsString()
  departamentoFiscal?: string;

  @IsString()
  provinciaFiscal: string;

  // Información Laboral
  @IsOptional()
  @IsString()
  ocupacion?: string;

  @IsOptional()
  @IsString()
  empresa?: string;

  @IsOptional()
  @IsDecimal()
  ingresosMensuales?: string;

  // Datos como Socio
  @IsOptional()
  @IsString()
  numeroSocio?: string;

  @IsOptional()
  @IsDateString()
  fechaAlta?: string;

  // Preferencias
  @IsOptional()
  @IsBoolean()
  recibirNotificaciones?: boolean;

  @IsOptional()
  @IsBoolean()
  recibirNotificacionesPorSMS?: boolean;

  @IsOptional()
  @IsBoolean()
  recibirFacturaPorEmail?: boolean;
}

export class UpdatePersonaDto {
  @IsOptional()
  @IsString()
  @Length(2, 100)
  nombreCompleto?: string;

  @IsOptional()
  @IsEnum([
    'RESPONSABLE_INSCRIPTO',
    'MONOTRIBUTISTA',
    'EXENTO',
    'CONSUMIDOR_FINAL',
    'NO_CATEGORIZADO',
  ])
  categoriaIVA?:
    | 'RESPONSABLE_INSCRIPTO'
    | 'MONOTRIBUTISTA'
    | 'EXENTO'
    | 'CONSUMIDOR_FINAL'
    | 'NO_CATEGORIZADO';

  // Datos Personales
  @IsOptional()
  @IsDateString()
  fechaNacimiento?: string;

  @IsOptional()
  @IsEnum(['SOLTERO', 'CASADO', 'DIVORCIADO', 'VIUDO'])
  estadoCivil?: 'SOLTERO' | 'CASADO' | 'DIVORCIADO' | 'VIUDO';

  @IsOptional()
  @IsString()
  nacionalidad?: string;

  // Contacto
  @IsOptional()
  @IsPhoneNumber('AR')
  telefono?: string;

  @IsOptional()
  @IsPhoneNumber('AR')
  telefonoMovil?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsEmail()
  emailSecundario?: string;

  // Domicilio Actual
  @IsOptional()
  @IsString()
  domicilioActual?: string;

  @IsOptional()
  @IsString()
  pisoActual?: string;

  @IsOptional()
  @IsString()
  codigoPostalActual?: string;

  @IsOptional()
  @IsString()
  localidadActual?: string;

  @IsOptional()
  @IsString()
  departamentoActual?: string;

  @IsOptional()
  @IsString()
  provinciaActual?: string;

  // Domicilio Fiscal
  @IsOptional()
  @IsString()
  domicilioFiscal?: string;

  @IsOptional()
  @IsString()
  pisoFiscal?: string;

  @IsOptional()
  @IsString()
  codigoPostalFiscal?: string;

  @IsOptional()
  @IsString()
  localidadFiscal?: string;

  @IsOptional()
  @IsString()
  departamentoFiscal?: string;

  @IsOptional()
  @IsString()
  provinciaFiscal?: string;

  // Información Laboral
  @IsOptional()
  @IsString()
  ocupacion?: string;

  @IsOptional()
  @IsString()
  empresa?: string;

  @IsOptional()
  @IsDecimal()
  ingresosMensuales?: string;

  // Datos como Socio
  @IsOptional()
  @IsString()
  numeroSocio?: string;

  @IsOptional()
  @IsDateString()
  fechaAlta?: string;

  @IsOptional()
  @IsEnum(['ACTIVO', 'SUSPENDIDO', 'DADO_DE_BAJA', 'MOROSO'])
  estadoSocio?: 'ACTIVO' | 'SUSPENDIDO' | 'DADO_DE_BAJA' | 'MOROSO';

  // Preferencias
  @IsOptional()
  @IsBoolean()
  recibirNotificaciones?: boolean;

  @IsOptional()
  @IsBoolean()
  recibirNotificacionesPorSMS?: boolean;

  @IsOptional()
  @IsBoolean()
  recibirFacturaPorEmail?: boolean;
}

export class ActualizarEstadoKYCDto {
  @IsEnum([
    'PENDIENTE',
    'EN_REVISION',
    'APROBADO',
    'RECHAZADO',
    'REQUIERE_INFORMACION_ADICIONAL',
  ])
  nuevoEstado:
    | 'PENDIENTE'
    | 'EN_REVISION'
    | 'APROBADO'
    | 'RECHAZADO'
    | 'REQUIERE_INFORMACION_ADICIONAL';

  @IsOptional()
  @IsString()
  motivo?: string;

  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsOptional()
  @IsDateString()
  proximaRevision?: string;
}

export class SubirDocumentoKYCDto {
  @IsEnum([
    'FRENTE_DNI',
    'DORSO_DNI',
    'SELFIE',
    'COMPROBANTE_DOMICILIO',
    'COMPROBANTE_INGRESOS',
    'CUIT_CONSTANCIA',
    'OTRO',
  ])
  tipoDocumento:
    | 'FRENTE_DNI'
    | 'DORSO_DNI'
    | 'SELFIE'
    | 'COMPROBANTE_DOMICILIO'
    | 'COMPROBANTE_INGRESOS'
    | 'CUIT_CONSTANCIA'
    | 'OTRO';

  @IsString()
  nombreArchivo: string;

  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsOptional()
  @IsDateString()
  fechaVencimiento?: string;
}

export class ValidarDocumentoKYCDto {
  @IsBoolean()
  validado: boolean;

  @IsOptional()
  @IsString()
  observaciones?: string;

  @IsOptional()
  @IsBoolean()
  requiereReemplazo?: boolean;
}

export class BuscarPersonasDto {
  @IsOptional()
  @IsString()
  busqueda?: string;

  @IsOptional()
  @IsEnum([
    'PENDIENTE',
    'EN_REVISION',
    'APROBADO',
    'RECHAZADO',
    'REQUIERE_INFORMACION_ADICIONAL',
  ])
  estadoKYC?:
    | 'PENDIENTE'
    | 'EN_REVISION'
    | 'APROBADO'
    | 'RECHAZADO'
    | 'REQUIERE_INFORMACION_ADICIONAL';

  @IsOptional()
  @IsEnum(['ACTIVO', 'SUSPENDIDO', 'DADO_DE_BAJA', 'MOROSO'])
  estadoSocio?: 'ACTIVO' | 'SUSPENDIDO' | 'DADO_DE_BAJA' | 'MOROSO';

  @IsOptional()
  @IsEnum(['DNI', 'CUIL', 'CUIT', 'PASAPORTE', 'CI'])
  tipoDocumento?: 'DNI' | 'CUIL' | 'CUIT' | 'PASAPORTE' | 'CI';

  @IsOptional()
  @IsString()
  localidad?: string;

  @IsOptional()
  @IsString()
  provincia?: string;

  @IsOptional()
  @IsDateString()
  fechaAltaDesde?: string;

  @IsOptional()
  @IsDateString()
  fechaAltaHasta?: string;

  @IsOptional()
  @IsBoolean()
  requiereActualizacionKYC?: boolean;

  @IsOptional()
  @IsBoolean()
  soloConCuentas?: boolean;

  @IsOptional()
  @IsBoolean()
  soloSinUsuario?: boolean;

  // Paginación
  @IsOptional()
  @IsNumber()
  @Min(1)
  pagina?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limite?: number;

  @IsOptional()
  @IsEnum(['nombre', 'numeroSocio', 'fechaAlta', 'estadoKYC'])
  ordenarPor?: 'nombre' | 'numeroSocio' | 'fechaAlta' | 'estadoKYC';

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  ordenDireccion?: 'asc' | 'desc';
}

export class SolicitudResetPasswordDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  motivo?: string;
}

export class ResetPasswordDto {
  @IsString()
  token: string;

  @IsString()
  @Length(8, 128)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      'La contraseña debe contener al menos una minúscula, una mayúscula, un número y un carácter especial',
  })
  nuevaPassword: string;
}

export class VincularUsuarioDto {
  @IsUUID()
  usuarioId: string;

  @IsOptional()
  @IsString()
  observaciones?: string;
}

export class EnviarNotificacionDto {
  @IsEnum(['EMAIL', 'SMS', 'PUSH', 'SISTEMA'])
  tipo: 'EMAIL' | 'SMS' | 'PUSH' | 'SISTEMA';

  @IsEnum(['FACTURACION', 'KYC', 'GENERAL', 'EMERGENCIA'])
  categoria: 'FACTURACION' | 'KYC' | 'GENERAL' | 'EMERGENCIA';

  @IsString()
  titulo: string;

  @IsString()
  mensaje: string;

  @IsOptional()
  metadata?: any;
}
