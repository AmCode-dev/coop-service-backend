export interface PersonaBasica {
  id: string;
  nombreCompleto: string;
  tipoDocumento: string;
  numeroDocumento: string;
  email?: string;
  telefono?: string;
  numeroSocio?: string;
  estadoSocio: string;
  estadoKYC: string;
}

export interface PersonaDetalle extends PersonaBasica {
  categoriaIVA: string;
  fechaNacimiento?: Date;
  estadoCivil?: string;
  nacionalidad?: string;
  telefonoMovil?: string;
  emailSecundario?: string;

  // Domicilio Actual
  domicilioActual?: string;
  pisoActual?: string;
  codigoPostalActual?: string;
  localidadActual?: string;
  departamentoActual?: string;
  provinciaActual?: string;

  // Domicilio Fiscal
  domicilioFiscal: string;
  pisoFiscal?: string;
  codigoPostalFiscal?: string;
  localidadFiscal: string;
  departamentoFiscal?: string;
  provinciaFiscal: string;

  // Información Laboral
  ocupacion?: string;
  empresa?: string;
  ingresosMensuales?: number;

  // Fechas importantes
  fechaAlta?: Date;
  fechaInicioKYC?: Date;
  fechaCompletadoKYC?: Date;
  proximaRevisionKYC?: Date;

  // Preferencias
  recibirNotificaciones: boolean;
  recibirNotificacionesPorSMS: boolean;
  recibirFacturaPorEmail: boolean;

  // KYC
  observacionesKYC?: string;
  requiereActualizacionKYC: boolean;

  // Auditoría
  createdAt: Date;
  updatedAt: Date;

  // Relaciones
  cooperativa?: {
    id: string;
    nombre: string;
  };
  usuariosVinculados?: Array<{
    id: string;
    usuario: {
      id: string;
      email: string;
      activo: boolean;
    };
    activo: boolean;
  }>;
  cuentasAsociadas?: Array<{
    id: string;
    numeroCuenta: string;
    inmueble: {
      domicilio: string;
      localidad: string;
    };
  }>;
}

export interface DocumentoKYCDetalle {
  id: string;
  tipoDocumento: string;
  nombreArchivo: string;
  urlArchivo: string;
  tamanioArchivo?: number;
  mimeType?: string;
  validado: boolean;
  fechaValidacion?: Date;
  validadoPor?: {
    id: string;
    nombre: string;
    apellido: string;
  };
  observaciones?: string;
  requiereReemplazo: boolean;
  fechaVencimiento?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface EstadisticasKYC {
  totalPersonas: number;
  pendientes: number;
  enRevision: number;
  aprobados: number;
  rechazados: number;
  requierenInformacionAdicional: number;
  documentosPendientesValidacion: number;
  proximosVencimientos: number;
}

export interface ResumenSocio {
  persona: PersonaDetalle;
  facturas: {
    pendientes: number;
    totalAdeudado: number;
    proximoVencimiento?: Date;
  };
  pagos: {
    totalPagado: number;
    ultimoPago?: Date;
    metodosPreferidos: string[];
  };
  consumo: {
    promedioMensual: number;
    ultimaLectura?: Date;
    tendencia: 'CRECIENTE' | 'DECRECIENTE' | 'ESTABLE';
  };
  cuenta: {
    numeroCuenta: string;
    serviciosActivos: string[];
    inmueble: {
      domicilio: string;
      localidad: string;
    };
  };
}

export interface HistorialKYC {
  id: string;
  estadoAnterior?: string;
  estadoNuevo: string;
  motivo?: string;
  observaciones?: string;
  fechaCambio: Date;
  cambiadoPor?: {
    id: string;
    nombre: string;
    apellido: string;
  };
}

export interface FiltrosPersonas {
  busqueda?: string; // Búsqueda en nombre, documento, email
  estadoKYC?: string; // PENDIENTE, EN_REVISION, APROBADO, etc.
  estadoSocio?: string; // ACTIVO, SUSPENDIDO, etc.
  tipoDocumento?: string; // DNI, CUIL, etc.
  localidad?: string;
  provincia?: string;
  fechaAltaDesde?: string;
  fechaAltaHasta?: string;
  requiereActualizacionKYC?: boolean;
  soloConCuentas?: boolean;
  soloSinUsuario?: boolean;

  // Paginación
  pagina?: number;
  limite?: number;
  ordenarPor?: 'nombre' | 'numeroSocio' | 'fechaAlta' | 'estadoKYC';
  ordenDireccion?: 'asc' | 'desc';
}

export interface ResultadoPaginado<T> {
  items: T[];
  total: number;
  pagina: number;
  limite: number;
  totalPaginas: number;
}

export interface SolicitudResetPassword {
  id: string;
  token: string;
  usado: boolean;
  fechaExpira: Date;
  motivo?: string;
  ipOrigen?: string;
  fechaUso?: Date;
  persona: {
    id: string;
    nombreCompleto: string;
    email?: string;
  };
}

export interface NotificacionPersona {
  id: string;
  tipo: string; // EMAIL, SMS, PUSH, SISTEMA
  categoria: string; // FACTURACION, KYC, GENERAL, EMERGENCIA
  titulo: string;
  mensaje: string;
  enviado: boolean;
  fechaEnvio?: Date;
  entregado: boolean;
  fechaEntrega?: Date;
  leido: boolean;
  fechaLectura?: Date;
  intentosEnvio: number;
  ultimoError?: string;
  metadata?: any;
  createdAt: Date;
}
