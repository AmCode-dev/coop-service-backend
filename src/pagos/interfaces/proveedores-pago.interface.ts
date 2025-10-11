// ============================================
// INTERFACES PARA PROVEEDORES DE PAGO
// ============================================

export enum TipoProveedorPago {
  MERCADOPAGO = 'MERCADOPAGO',
  PAYPAL = 'PAYPAL',
  STRIPE = 'STRIPE',
  PAYWAY = 'PAYWAY',
  DECIDIR = 'DECIDIR',
  TODO_PAGO = 'TODO_PAGO',
  RAPIPAGO = 'RAPIPAGO',
  PAGO_FACIL = 'PAGO_FACIL',
  LINK_PAGOS = 'LINK_PAGOS',
  BANCO_NACION = 'BANCO_NACION',
  BANCO_PROVINCIA = 'BANCO_PROVINCIA',
  TRANSFERENCIA_DIRECTA = 'TRANSFERENCIA_DIRECTA',
  CUSTOM = 'CUSTOM',
}

export enum EstadoProveedorPago {
  ACTIVO = 'ACTIVO',
  INACTIVO = 'INACTIVO',
  EN_PRUEBAS = 'EN_PRUEBAS',
  MANTENIMIENTO = 'MANTENIMIENTO',
  DESHABILITADO = 'DESHABILITADO',
}

export interface ProveedorPago {
  id: string;
  nombre: string;
  codigo: string;
  tipo: TipoProveedorPago;
  descripcion?: string;
  logoUrl?: string;
  sitioWeb?: string;
  
  // Configuración técnica
  apiBaseUrl?: string;
  versionApi?: string;
  documentacionUrl?: string;
  
  // Características
  soportaWebhooks: boolean;
  soportaTarjetas: boolean;
  soportaTransferencias: boolean;
  soportaEfectivo: boolean;
  soportaRecurrentes: boolean;
  
  // Límites y configuración
  montoMinimo?: number;
  montoMaximo?: number;
  comisionPorcentaje?: number;
  comisionFija?: number;
  
  // Configuración de tiempo
  tiempoExpiracionMinutos: number;
  tiempoConfirmacionHoras: number;
  
  // Datos del proveedor
  paisesDisponibles: string[];
  monedasSoportadas: string[];
  
  // Estado
  estado: EstadoProveedorPago;
  activo: boolean;
  
  // Auditoría
  createdAt: Date;
  updatedAt: Date;
}

export interface ProveedorPagoCooperativa {
  id: string;
  
  // Configuración específica de la cooperativa
  activo: boolean;
  esPrincipal: boolean;
  
  // Credenciales de acceso (se manejarán encriptadas)
  tokenAcceso: string;
  tokenRefresh?: string;
  clavePublica?: string;
  clavePrivada?: string;
  
  // Configuración específica
  entornoPruebas: boolean;
  webhookUrl?: string;
  webhookSecret?: string;
  
  // Configuración personalizada
  configuracionPersonalizada?: Record<string, any>;
  
  // Límites personalizados
  montoMinimo?: number;
  montoMaximo?: number;
  comisionAdicional?: number;
  
  // Información de integración
  fechaIntegracion: Date;
  fechaUltimaConexion?: Date;
  estadoConexion: string;
  ultimoErrorConexion?: string;
  
  // Estadísticas de uso
  totalTransacciones: number;
  montoTotalProcesado: number;
  ultimaTransaccion?: Date;
  
  // Relaciones
  cooperativaId: string;
  proveedorPagoId: string;
  proveedorPago?: ProveedorPago;
  
  // Auditoría
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// INTERFACES PARA PAGOS EXTERNOS
// ============================================

export interface SolicitudPagoExterna {
  id: string;
  facturaId: string;
  monto: number;
  descripcion: string;
  emailPagador?: string;
  telefonoPagador?: string;
  metodosPermitidos?: string[];
  fechaExpiracion: Date;
  urlExito?: string;
  urlError?: string;
  urlPendiente?: string;
  urlWebhook?: string;
  referencia?: string;
  metadata?: Record<string, any>;
}

export interface RespuestaPagoExterna {
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

export interface NotificacionWebhook {
  proveedorTipo: TipoProveedorPago;
  idTransaccionExterna: string;
  estado: string;
  monto?: number;
  fechaPago?: Date;
  metodoPago?: string;
  comision?: number;
  respuestaCompleta: Record<string, any>;
  firma?: string;
  timestamp: Date;
}

export interface ConfiguracionProveedor {
  entornoPruebas: boolean;
  timeout: number;
  reintentos: number;
  webhookValidacion: boolean;
  encriptacion: {
    algoritmo: string;
    clave: string;
  };
  configuracionEspecifica: Record<string, any>;
}

// ============================================
// INTERFACES PARA INTEGRACIONES ESPECÍFICAS
// ============================================

export interface ConfiguracionMercadoPago {
  accessToken: string;
  publicKey?: string;
  clientId?: string;
  clientSecret?: string;
  webhookSecret?: string;
  notificationUrl?: string;
  backUrls?: {
    success: string;
    pending: string;
    failure: string;
  };
  autoReturn?: 'approved' | 'all';
  excludedPaymentMethods?: string[];
  excludedPaymentTypes?: string[];
  installments?: number;
  marketplace?: {
    fee: number;
    feeCollectorId?: string;
  };
}

export interface ConfiguracionStripe {
  secretKey: string;
  publicKey: string;
  webhookSecret: string;
  apiVersion?: string;
  accountId?: string;
  applicationFee?: number;
  paymentMethodTypes?: string[];
  captureMethod?: 'automatic' | 'manual';
}

export interface ConfiguracionPayPal {
  clientId: string;
  clientSecret: string;
  mode: 'sandbox' | 'live';
  webhookId?: string;
  webhookSecret?: string;
  returnUrl?: string;
  cancelUrl?: string;
  brandName?: string;
  locale?: string;
}

// ============================================
// INTERFACES PARA MANEJO DE ERRORES
// ============================================

export interface ErrorPagoExterno {
  codigo: string;
  mensaje: string;
  proveedor: TipoProveedorPago;
  timestamp: Date;
  detalles?: Record<string, any>;
  esRecuperable: boolean;
  accionRecomendada?: string;
}

export interface LogTransaccion {
  id: string;
  facturaId: string;
  proveedorTipo: TipoProveedorPago;
  accion: 'CREAR_PAGO' | 'CONSULTAR_ESTADO' | 'PROCESAR_WEBHOOK' | 'CANCELAR_PAGO';
  request: Record<string, any>;
  response: Record<string, any>;
  duracionMs: number;
  exito: boolean;
  error?: ErrorPagoExterno;
  timestamp: Date;
  ipOrigen?: string;
  userAgent?: string;
}