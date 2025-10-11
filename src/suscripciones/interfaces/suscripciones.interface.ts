// ============================================
// INTERFACES DEL SISTEMA DE SUSCRIPCIONES
// ============================================

// ============================================
// ENUMS LOCALES (hasta que se genere Prisma Client)
// ============================================

export enum EstadoSuscripcion {
  ACTIVA = 'ACTIVA',
  SUSPENDIDA = 'SUSPENDIDA',
  VENCIDA = 'VENCIDA',
  CANCELADA = 'CANCELADA',
}

export enum EstadoSolicitudComision {
  PENDIENTE = 'PENDIENTE',
  EN_REVISION = 'EN_REVISION',
  APROBADA = 'APROBADA',
  RECHAZADA = 'RECHAZADA',
}

export enum EstadoSuscripcionFactura {
  GENERADA = 'GENERADA',
  APROBADA = 'APROBADA',
  PAGADA = 'PAGADA',
  VENCIDA = 'VENCIDA',
  ANULADA = 'ANULADA',
}

export enum TipoPagoSuscripcion {
  SISTEMA = 'SISTEMA',
  EXTERNO = 'EXTERNO',
}

// ============================================
// CONFIGURACIÓN DE SUSCRIPCIÓN
// ============================================

export interface ConfiguracionSuscripcion {
  id: string;
  cooperativaId: string;

  // Configuración de comisión
  porcentajeComision: number;
  comisionMinima: number;
  comisionMaxima?: number;

  // Configuración de facturación
  diaGeneracionFactura: number;
  diasVencimientoFactura: number;

  // Configuración de pagos
  incluyeIVA: boolean;
  porcentajeIVA: number;

  // Información comercial
  fechaInicioSuscripcion: Date;
  fechaFinSuscripcion?: Date;
  observaciones?: string;

  // Configuración de notificaciones
  notificarGeneracionFactura: boolean;
  notificarVencimientoFactura: boolean;
  diasAvisoVencimiento: number;

  // Estado
  activa: boolean;
  fechaUltimModificacion: Date;
  modificadoPorSuperAdmin?: string;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// SOLICITUD DE CAMBIO DE COMISIÓN
// ============================================

export interface SolicitudCambioComision {
  id: string;
  configuracionId: string;

  // Datos de la solicitud
  porcentajeComisionActual: number;
  porcentajeComisionSolicitado: number;

  // Justificación
  motivo: string;
  justificacion?: string;
  documentosAdjuntos: string[];

  // Datos comerciales
  volumenMensualPromedio?: number;
  cantidadPagosPromedio?: number;
  tiempoComoCiente?: number;
  proyeccionCrecimiento?: number;

  // Estado de la solicitud
  estado: EstadoSolicitudComision;
  fechaSolicitud: Date;
  fechaRevision?: Date;
  fechaResolucion?: Date;

  // Respuesta de superadmins
  respuestaSuperAdmin?: string;
  porcentajeComisionAprobado?: number;
  fechaInicioNuevaComision?: Date;

  // Auditoría
  revisadoPorSuperAdmin?: string;
  aprobadoPorSuperAdmin?: string;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// FACTURA DE SUSCRIPCIÓN
// ============================================

export interface SuscripcionFactura {
  id: string;
  configuracionId: string;

  // Datos del período
  mes: number;
  anio: number;
  periodo: string;

  // Fechas importantes
  fechaGeneracion: Date;
  fechaVencimiento: Date;
  fechaAprobacion?: Date;
  fechaPago?: Date;

  // Datos de facturación
  cantidadPagos: number;
  montoTotalPagos: number;
  porcentajeComision: number;

  // Cálculos
  subtotalComision: number;
  montoIVA: number;
  totalFactura: number;

  // Estado
  estado: EstadoSuscripcionFactura;
  tipoPago?: TipoPagoSuscripcion;
  referenciaPago?: string;

  // Observaciones
  observaciones?: string;
  observacionesPago?: string;

  // Auditoría
  generadoPorSistema: boolean;
  aprobadoPorSuperAdmin?: string;
  marcadoPagadoPor?: string;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// CONFIGURACIÓN DE DATOS BANCARIOS
// ============================================

export interface ConfiguracionDatosBancarios {
  id: string;

  // Datos bancarios principales
  nombreCuenta: string;
  nombreBanco: string;
  cbu: string;
  alias?: string;

  // Datos adicionales
  numeroCuenta?: string;
  tipoCuenta?: string;
  sucursal?: string;

  // Información para facturas
  razonSocialTitular: string;
  cuitTitular: string;
  domicilioFiscal: string;

  // Configuración
  activo: boolean;
  esPrincipal: boolean;

  // Información adicional
  instruccionesPago?: string;
  horarioAtencion?: string;
  emailContacto?: string;
  telefonoContacto?: string;

  // Auditoría
  createdAt: Date;
  updatedAt: Date;
  creadoPorSuperAdmin: string;
  modificadoPorSuperAdmin?: string;
}

// ============================================
// INTERFACES PARA ESTADÍSTICAS Y REPORTES
// ============================================

export interface EstadisticasSuscripcion {
  cooperativaId: string;
  cooperativaNombre: string;

  // Datos de configuración actual
  porcentajeComisionActual: number;
  fechaInicioSuscripcion: Date;
  estadoSuscripcion: EstadoSuscripcion;

  // Estadísticas del mes actual
  mesActual: {
    mes: number;
    anio: number;
    cantidadPagos: number;
    montoTotalPagos: number;
    comisionGenerada: number;
    facturaGenerada: boolean;
    estadoFactura?: EstadoSuscripcionFactura;
  };

  // Estadísticas históricas (últimos 12 meses)
  historicoMensual: {
    mes: number;
    anio: number;
    cantidadPagos: number;
    montoTotalPagos: number;
    comisionGenerada: number;
    facturaPagada: boolean;
  }[];

  // Totales acumulados
  totales: {
    totalPagosRealizados: number;
    montoTotalProcesado: number;
    comisionTotalGenerada: number;
    facturasPendientesPago: number;
    montoFacturasPendientes: number;
  };
}

export interface ResumenComisionesSuperAdmin {
  // Datos del período consultado
  mes: number;
  anio: number;
  periodo: string;

  // Totales globales
  totalCooperativasActivas: number;
  totalPagosRealizados: number;
  montoTotalProcesado: number;
  comisionTotalGenerada: number;

  // Estado de facturas
  facturasGeneradas: number;
  facturasAprobadas: number;
  facturasPagadas: number;
  facturasPendientes: number;
  montoFacturasPendientes: number;

  // Top cooperativas por volumen
  topCooperativasPorVolumen: {
    cooperativaId: string;
    cooperativaNombre: string;
    cantidadPagos: number;
    montoTotalPagos: number;
    comisionGenerada: number;
    porcentajeComision: number;
  }[];

  // Solicitudes de cambio de comisión
  solicitudesPendientes: number;
  solicitudesAprobadas: number;
  solicitudesRechazadas: number;
}

// ============================================
// INTERFACES PARA DATOS DE FACTURACIÓN
// ============================================

export interface DatosFacturacionMensual {
  cooperativaId: string;
  mes: number;
  anio: number;

  // Resumen de pagos
  pagos: {
    id: string;
    monto: number;
    fechaPago: Date;
    facturaId?: string;
    proveedorPagoId?: string;
    comisionProveedor?: number;
  }[];

  // Cálculos
  cantidadPagos: number;
  montoTotalPagos: number;
  porcentajeComision: number;
  subtotalComision: number;
  montoIVA: number;
  totalFactura: number;
}

export interface HistorialCambiosComision {
  id: string;
  configuracionId: string;
  campoModificado: string;
  valorAnterior: string;
  valorNuevo: string;
  motivo?: string;
  fechaCambio: Date;
  realizadoPorSuperAdmin: string;
  aprobadoPorSuperAdmin?: string;
}

// ============================================
// INTERFACES PARA RESPUESTAS DE API
// ============================================

export interface RespuestaConfiguracionSuscripcion {
  configuracion: ConfiguracionSuscripcion;
  estadisticas: EstadisticasSuscripcion;
  solicitudesPendientes: SolicitudCambioComision[];
  ultimasFacturas: SuscripcionFactura[];
}

export interface RespuestaDashboardSuperAdmin {
  resumenGeneral: ResumenComisionesSuperAdmin;
  solicitudesPendientes: SolicitudCambioComision[];
  facturasPendientesAprobacion: SuscripcionFactura[];
  alertas: {
    tipo: 'vencimiento' | 'solicitud' | 'factura' | 'pago';
    mensaje: string;
    cooperativaId?: string;
    urgencia: 'baja' | 'media' | 'alta';
    fechaCreacion: Date;
  }[];
}

// ============================================
// INTERFACES PARA WEBHOOKS Y NOTIFICACIONES
// ============================================

export interface NotificacionSuscripcion {
  tipo:
    | 'factura_generada'
    | 'factura_aprobada'
    | 'factura_vencida'
    | 'pago_recibido'
    | 'solicitud_comision';
  cooperativaId: string;
  facturaId?: string;
  solicitudId?: string;
  mensaje: string;
  datos: any;
  fechaCreacion: Date;
}

export interface WebhookSuscripcion {
  evento: string;
  timestamp: Date;
  cooperativaId: string;
  datos: {
    facturaId?: string;
    solicitudId?: string;
    estado?: string;
    monto?: number;
    [key: string]: any;
  };
}
