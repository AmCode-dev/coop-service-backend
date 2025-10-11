-- CreateEnum
CREATE TYPE "TipoAccion" AS ENUM ('READ', 'WRITE', 'EXECUTE', 'DELETE');

-- CreateEnum
CREATE TYPE "TipoDocumento" AS ENUM ('DNI', 'CUIL', 'CUIT', 'PASAPORTE', 'CI');

-- CreateEnum
CREATE TYPE "CategoriaIVA" AS ENUM ('RESPONSABLE_INSCRIPTO', 'MONOTRIBUTISTA', 'EXENTO', 'CONSUMIDOR_FINAL', 'NO_CATEGORIZADO');

-- CreateEnum
CREATE TYPE "EstadoKYC" AS ENUM ('PENDIENTE', 'EN_REVISION', 'APROBADO', 'RECHAZADO', 'REQUIERE_INFORMACION_ADICIONAL');

-- CreateEnum
CREATE TYPE "TipoDocumentoKYC" AS ENUM ('FRENTE_DNI', 'DORSO_DNI', 'SELFIE', 'COMPROBANTE_DOMICILIO', 'COMPROBANTE_INGRESOS', 'CUIT_CONSTANCIA', 'OTRO');

-- CreateEnum
CREATE TYPE "EstadoSocio" AS ENUM ('ACTIVO', 'SUSPENDIDO', 'DADO_DE_BAJA', 'MOROSO');

-- CreateEnum
CREATE TYPE "TipoVinculacion" AS ENUM ('CUENTA_SERVICIO', 'INMUEBLE');

-- CreateEnum
CREATE TYPE "AccionVinculacion" AS ENUM ('VINCULACION', 'DESVINCULACION', 'CAMBIO');

-- CreateEnum
CREATE TYPE "TipoConcepto" AS ENUM ('TARIFA_BASE', 'TARIFA_EXTRA', 'TASA', 'IMPUESTO', 'FONDO_REGULATORIO', 'PUNITORIO', 'IVA', 'DESCUENTO', 'OTRO');

-- CreateEnum
CREATE TYPE "TipoCalculo" AS ENUM ('POR_CANTIDAD', 'PORCENTUAL', 'FIJO', 'AGREGADO');

-- CreateEnum
CREATE TYPE "EstadoFactura" AS ENUM ('PENDIENTE', 'PAGADA', 'VENCIDA', 'PARCIALMENTE_PAGADA', 'ANULADA');

-- CreateEnum
CREATE TYPE "EstadoSolicitudPago" AS ENUM ('PENDIENTE', 'PAGADA', 'VENCIDA', 'ANULADA');

-- CreateEnum
CREATE TYPE "EstadoIntencionPago" AS ENUM ('INICIADA', 'EN_PROCESO', 'APROBADA', 'RECHAZADA', 'EXPIRADA');

-- CreateEnum
CREATE TYPE "TipoPago" AS ENUM ('EFECTIVO', 'TRANSFERENCIA', 'TARJETA_DEBITO', 'TARJETA_CREDITO', 'CHEQUE', 'OTRO');

-- CreateEnum
CREATE TYPE "TipoOperacion" AS ENUM ('TOMA_LECTURA', 'REPARACION', 'MANTENIMIENTO', 'MEJORA', 'APROVISIONAMIENTO', 'INSPECCION', 'CORTE_SERVICIO', 'RECONEXION', 'INSTALACION', 'DESINSTALACION', 'OTRO');

-- CreateEnum
CREATE TYPE "EstadoOperacion" AS ENUM ('PROGRAMADA', 'EN_CURSO', 'COMPLETADA', 'CANCELADA', 'PENDIENTE_REVISION');

-- CreateEnum
CREATE TYPE "PrioridadOperacion" AS ENUM ('BAJA', 'MEDIA', 'ALTA', 'URGENTE');

-- CreateEnum
CREATE TYPE "TipoReporte" AS ENUM ('FACTURACION', 'COBRANZAS', 'CUENTAS_CORRIENTES', 'SERVICIOS', 'CONSUMOS', 'OPERACIONES', 'USUARIOS', 'PAGOS', 'DEUDORES', 'ESTADISTICAS', 'AUDITORIA', 'PERSONALIZADO');

-- CreateEnum
CREATE TYPE "FormatoExportacion" AS ENUM ('PDF', 'EXCEL', 'CSV', 'JSON', 'XML');

-- CreateEnum
CREATE TYPE "EstadoReporte" AS ENUM ('SOLICITADO', 'PROCESANDO', 'COMPLETADO', 'ERROR', 'CANCELADO');

-- CreateEnum
CREATE TYPE "TipoDocumentoLegajo" AS ENUM ('ESCRITURA', 'BOLETO_COMPRAVENTA', 'CONTRATO_ALQUILER', 'PODER_NOTARIAL', 'ACTA_DEFUNCION', 'SUCESION', 'CERTIFICADO_DOMINIO', 'PLANO_CATASTRAL', 'HABILITACION_MUNICIPAL', 'CONSTANCIA_AFIP', 'CARTA_DOCUMENTO', 'NOTA_ADMINISTRATIVA', 'COMPROBANTE_PAGO', 'FOTOGRAFIA', 'OTRO');

-- CreateEnum
CREATE TYPE "EstadoLegajo" AS ENUM ('ACTIVO', 'ARCHIVADO', 'EN_REVISION', 'INCOMPLETO', 'OBSERVADO');

-- CreateEnum
CREATE TYPE "MotivoTransferencia" AS ENUM ('COMPRAVENTA', 'DONACION', 'HERENCIA', 'DIVORCIO', 'CESION_DERECHOS', 'ADJUDICACION_JUDICIAL', 'RESTITUCION', 'CAMBIO_DATOS', 'SUBDIVISION', 'UNIFICACION', 'OTRO');

-- CreateEnum
CREATE TYPE "EstadoOnboarding" AS ENUM ('INICIADO', 'EN_PROGRESO', 'PENDIENTE_VALIDACION', 'PENDIENTE_APROBACION', 'COMPLETADO', 'RECHAZADO', 'CANCELADO', 'EXPIRADO');

-- CreateEnum
CREATE TYPE "TipoReglaOnboarding" AS ENUM ('VALIDACION_DATOS', 'VERIFICACION_IDENTIDAD', 'COMPROBACION_DOMICILIO', 'VALIDACION_CREDITICIA', 'INTEGRACION_EXTERNA', 'ASIGNACION_SERVICIOS', 'CREACION_CUENTA', 'NOTIFICACION', 'CUSTOM');

-- CreateEnum
CREATE TYPE "EtapaOnboarding" AS ENUM ('INICIO', 'VALIDACION', 'DOCUMENTACION', 'VERIFICACION', 'APROBACION', 'FINALIZACION');

-- CreateEnum
CREATE TYPE "EstadoDocumento" AS ENUM ('PENDIENTE', 'EN_REVISION', 'APROBADO', 'RECHAZADO', 'REQUERIDO_REENVIO');

-- CreateEnum
CREATE TYPE "EstadoPaso" AS ENUM ('PENDIENTE', 'EN_PROGRESO', 'COMPLETADO', 'FALLIDO', 'OMITIDO');

-- CreateEnum
CREATE TYPE "TipoValidacion" AS ENUM ('EMAIL', 'TELEFONO', 'DOCUMENTO_IDENTIDAD', 'DOMICILIO', 'REFERENCIA_CREDITICIA', 'ANTECEDENTES', 'CUSTOM');

-- CreateEnum
CREATE TYPE "EstadoValidacion" AS ENUM ('PENDIENTE', 'EN_PROGRESO', 'EXITOSA', 'FALLIDA', 'REINTENTANDO');

-- CreateEnum
CREATE TYPE "TipoComunicacion" AS ENUM ('BIENVENIDA', 'RECORDATORIO', 'SOLICITUD_DOCUMENTOS', 'APROBACION', 'RECHAZO', 'FINALIZACION', 'CUSTOM');

-- CreateEnum
CREATE TYPE "CanalComunicacion" AS ENUM ('EMAIL', 'SMS', 'WHATSAPP', 'PUSH_NOTIFICATION', 'LLAMADA');

-- CreateEnum
CREATE TYPE "EstadoComunicacion" AS ENUM ('PENDIENTE', 'ENVIADA', 'ENTREGADA', 'LEIDA', 'RESPONDIDA', 'FALLIDA');

-- CreateEnum
CREATE TYPE "EstadoEjecucionRegla" AS ENUM ('PENDIENTE', 'EJECUTANDO', 'COMPLETADA', 'FALLIDA', 'REINTENTANDO');

-- CreateEnum
CREATE TYPE "TipoProveedorPago" AS ENUM ('MERCADOPAGO', 'PAYPAL', 'STRIPE', 'PAYWAY', 'DECIDIR', 'TODO_PAGO', 'RAPIPAGO', 'PAGO_FACIL', 'LINK_PAGOS', 'BANCO_NACION', 'BANCO_PROVINCIA', 'TRANSFERENCIA_DIRECTA', 'CUSTOM');

-- CreateEnum
CREATE TYPE "EstadoProveedorPago" AS ENUM ('ACTIVO', 'INACTIVO', 'EN_PRUEBAS', 'MANTENIMIENTO', 'DESHABILITADO');

-- CreateEnum
CREATE TYPE "EstadoSuscripcion" AS ENUM ('ACTIVA', 'SUSPENDIDA', 'VENCIDA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "EstadoSolicitudComision" AS ENUM ('PENDIENTE', 'EN_REVISION', 'APROBADA', 'RECHAZADA');

-- CreateEnum
CREATE TYPE "EstadoSuscripcionFactura" AS ENUM ('GENERADA', 'APROBADA', 'PAGADA', 'VENCIDA', 'ANULADA');

-- CreateEnum
CREATE TYPE "TipoPagoSuscripcion" AS ENUM ('SISTEMA', 'EXTERNO');

-- CreateTable
CREATE TABLE "cooperativas" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "razonSocial" TEXT NOT NULL,
    "cuit" TEXT NOT NULL,
    "domicilio" TEXT NOT NULL,
    "localidad" TEXT NOT NULL,
    "provincia" TEXT NOT NULL,
    "codigoPostal" TEXT NOT NULL,
    "telefono" TEXT,
    "email" TEXT,
    "logo" TEXT,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cooperativas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "telefono" TEXT,
    "avatar" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios_cooperativas" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "cooperativaId" TEXT NOT NULL,
    "esEmpleado" BOOLEAN NOT NULL DEFAULT false,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fechaAlta" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "personaId" TEXT,

    CONSTRAINT "usuarios_cooperativas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isRevoked" BOOLEAN NOT NULL DEFAULT false,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "deviceId" TEXT,
    "lastUsedAt" TIMESTAMP(3),
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "replacedByTokenId" TEXT,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "esSistema" BOOLEAN NOT NULL DEFAULT false,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cooperativaId" TEXT NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios_roles" (
    "id" TEXT NOT NULL,
    "asignadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "usuarioCooperativaId" TEXT NOT NULL,
    "rolId" TEXT NOT NULL,

    CONSTRAINT "usuarios_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "secciones_sistema" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "descripcion" TEXT,
    "icono" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "cooperativaId" TEXT NOT NULL,

    CONSTRAINT "secciones_sistema_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles_permisos" (
    "id" TEXT NOT NULL,
    "accion" "TipoAccion" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rolId" TEXT NOT NULL,
    "seccionId" TEXT NOT NULL,

    CONSTRAINT "roles_permisos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "personas" (
    "id" TEXT NOT NULL,
    "nombreCompleto" TEXT NOT NULL,
    "tipoDocumento" "TipoDocumento" NOT NULL,
    "numeroDocumento" TEXT NOT NULL,
    "categoriaIVA" "CategoriaIVA" NOT NULL DEFAULT 'CONSUMIDOR_FINAL',
    "fechaNacimiento" TIMESTAMP(3),
    "estadoCivil" TEXT,
    "nacionalidad" TEXT DEFAULT 'Argentina',
    "telefono" TEXT,
    "telefonoMovil" TEXT,
    "email" TEXT,
    "emailSecundario" TEXT,
    "domicilioActual" TEXT,
    "pisoActual" TEXT,
    "codigoPostalActual" TEXT,
    "localidadActual" TEXT,
    "departamentoActual" TEXT,
    "provinciaActual" TEXT,
    "domicilioFiscal" TEXT NOT NULL,
    "pisoFiscal" TEXT,
    "codigoPostalFiscal" TEXT,
    "localidadFiscal" TEXT NOT NULL,
    "departamentoFiscal" TEXT,
    "provinciaFiscal" TEXT NOT NULL,
    "ocupacion" TEXT,
    "empresa" TEXT,
    "ingresosMensuales" DECIMAL(12,2),
    "numeroSocio" TEXT,
    "fechaAlta" TIMESTAMP(3),
    "estadoSocio" "EstadoSocio" NOT NULL DEFAULT 'ACTIVO',
    "estadoKYC" "EstadoKYC" NOT NULL DEFAULT 'PENDIENTE',
    "fechaInicioKYC" TIMESTAMP(3),
    "fechaCompletadoKYC" TIMESTAMP(3),
    "observacionesKYC" TEXT,
    "requiereActualizacionKYC" BOOLEAN NOT NULL DEFAULT false,
    "proximaRevisionKYC" TIMESTAMP(3),
    "recibirNotificaciones" BOOLEAN NOT NULL DEFAULT true,
    "recibirNotificacionesPorSMS" BOOLEAN NOT NULL DEFAULT false,
    "recibirFacturaPorEmail" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cooperativaId" TEXT NOT NULL,

    CONSTRAINT "personas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documentos_kyc" (
    "id" TEXT NOT NULL,
    "personaId" TEXT NOT NULL,
    "tipoDocumento" "TipoDocumentoKYC" NOT NULL,
    "nombreArchivo" TEXT NOT NULL,
    "urlArchivo" TEXT NOT NULL,
    "tamanioArchivo" INTEGER,
    "mimeType" TEXT,
    "validado" BOOLEAN NOT NULL DEFAULT false,
    "fechaValidacion" TIMESTAMP(3),
    "validadoPorId" TEXT,
    "observaciones" TEXT,
    "requiereReemplazo" BOOLEAN NOT NULL DEFAULT false,
    "fechaVencimiento" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documentos_kyc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historial_estado_kyc" (
    "id" TEXT NOT NULL,
    "personaId" TEXT NOT NULL,
    "estadoAnterior" "EstadoKYC",
    "estadoNuevo" "EstadoKYC" NOT NULL,
    "motivo" TEXT,
    "observaciones" TEXT,
    "fechaCambio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cambiadoPorId" TEXT,

    CONSTRAINT "historial_estado_kyc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solicitudes_reset_password" (
    "id" TEXT NOT NULL,
    "personaId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "usado" BOOLEAN NOT NULL DEFAULT false,
    "fechaExpira" TIMESTAMP(3) NOT NULL,
    "ipOrigen" TEXT,
    "userAgent" TEXT,
    "motivo" TEXT,
    "fechaUso" TIMESTAMP(3),
    "ipUso" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "solicitudes_reset_password_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notificaciones_personas" (
    "id" TEXT NOT NULL,
    "personaId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "mensaje" TEXT NOT NULL,
    "enviado" BOOLEAN NOT NULL DEFAULT false,
    "fechaEnvio" TIMESTAMP(3),
    "entregado" BOOLEAN NOT NULL DEFAULT false,
    "fechaEntrega" TIMESTAMP(3),
    "leido" BOOLEAN NOT NULL DEFAULT false,
    "fechaLectura" TIMESTAMP(3),
    "intentosEnvio" INTEGER NOT NULL DEFAULT 0,
    "ultimoError" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notificaciones_personas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inmuebles" (
    "id" TEXT NOT NULL,
    "domicilio" TEXT NOT NULL,
    "piso" TEXT,
    "codigoPostal" TEXT NOT NULL,
    "localidad" TEXT NOT NULL,
    "departamento" TEXT,
    "provincia" TEXT NOT NULL,
    "seccion" TEXT,
    "chacra" TEXT,
    "manzana" TEXT,
    "lote" TEXT,
    "parcela" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "titularInmuebleId" TEXT NOT NULL,

    CONSTRAINT "inmuebles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "servicios_disponibles" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cooperativaId" TEXT NOT NULL,

    CONSTRAINT "servicios_disponibles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categorias_consumo" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "numero" INTEGER,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cooperativaId" TEXT NOT NULL,
    "servicioId" TEXT NOT NULL,

    CONSTRAINT "categorias_consumo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historial_precios_categorias" (
    "id" TEXT NOT NULL,
    "precioBase" DECIMAL(12,4) NOT NULL,
    "mes" INTEGER NOT NULL,
    "anio" INTEGER NOT NULL,
    "vigenciaDesde" TIMESTAMP(3) NOT NULL,
    "vigenciaHasta" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "categoriaId" TEXT NOT NULL,

    CONSTRAINT "historial_precios_categorias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cuentas" (
    "id" TEXT NOT NULL,
    "numeroCuenta" TEXT NOT NULL,
    "fechaAlta" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cooperativaId" TEXT NOT NULL,
    "titularServicioId" TEXT NOT NULL,
    "inmuebleId" TEXT NOT NULL,

    CONSTRAINT "cuentas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cuentas_servicios" (
    "id" TEXT NOT NULL,
    "fechaAlta" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaBaja" TIMESTAMP(3),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cuentaId" TEXT NOT NULL,
    "servicioId" TEXT NOT NULL,
    "categoriaId" TEXT NOT NULL,
    "medidorId" TEXT,

    CONSTRAINT "cuentas_servicios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medidores" (
    "id" TEXT NOT NULL,
    "numeroMedidor" TEXT NOT NULL,
    "marca" TEXT,
    "modelo" TEXT,
    "fechaInstalacion" TIMESTAMP(3),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cooperativaId" TEXT NOT NULL,
    "inmuebleId" TEXT,

    CONSTRAINT "medidores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lecturas" (
    "id" TEXT NOT NULL,
    "fechaLectura" TIMESTAMP(3) NOT NULL,
    "valorLectura" DECIMAL(12,2) NOT NULL,
    "consumoCalculado" DECIMAL(12,2),
    "mes" INTEGER NOT NULL,
    "anio" INTEGER NOT NULL,
    "observaciones" TEXT,
    "esPrincipal" BOOLEAN NOT NULL DEFAULT false,
    "lecturaAnterior" DECIMAL(12,2),
    "anomalia" BOOLEAN NOT NULL DEFAULT false,
    "tipoAnomalia" TEXT,
    "tomadoPorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "medidorId" TEXT NOT NULL,
    "facturaId" TEXT,

    CONSTRAINT "lecturas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historial_vinculaciones_medidor" (
    "id" TEXT NOT NULL,
    "tipoVinculacion" "TipoVinculacion" NOT NULL,
    "accion" "AccionVinculacion" NOT NULL,
    "entidadAnteriorId" TEXT,
    "entidadNuevaId" TEXT,
    "motivo" TEXT,
    "observaciones" TEXT,
    "fechaOperacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "medidorId" TEXT NOT NULL,
    "operadoPorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historial_vinculaciones_medidor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conceptos_facturables" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "descripcion" TEXT,
    "tipoConcepto" "TipoConcepto" NOT NULL,
    "tipoCalculo" "TipoCalculo" NOT NULL,
    "valorActual" DECIMAL(12,4),
    "aplicaIVA" BOOLEAN NOT NULL DEFAULT false,
    "porcentajeIVA" DECIMAL(5,2),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "esConfigurable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cooperativaId" TEXT NOT NULL,

    CONSTRAINT "conceptos_facturables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historial_conceptos" (
    "id" TEXT NOT NULL,
    "valor" DECIMAL(12,4) NOT NULL,
    "vigenciaDesde" TIMESTAMP(3) NOT NULL,
    "vigenciaHasta" TIMESTAMP(3),
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "conceptoId" TEXT NOT NULL,

    CONSTRAINT "historial_conceptos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facturas" (
    "id" TEXT NOT NULL,
    "numeroFactura" TEXT NOT NULL,
    "mes" INTEGER NOT NULL,
    "anio" INTEGER NOT NULL,
    "periodo" TEXT NOT NULL,
    "fechaEmision" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaVencimiento" TIMESTAMP(3) NOT NULL,
    "subtotal" DECIMAL(12,2) NOT NULL,
    "totalIVA" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(12,2) NOT NULL,
    "saldoPendiente" DECIMAL(12,2) NOT NULL,
    "estado" "EstadoFactura" NOT NULL DEFAULT 'PENDIENTE',
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cuentaId" TEXT NOT NULL,
    "cuentaServicioId" TEXT NOT NULL,

    CONSTRAINT "facturas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "items_factura" (
    "id" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "cantidad" DECIMAL(12,4) NOT NULL,
    "precioUnitario" DECIMAL(12,4) NOT NULL,
    "subtotal" DECIMAL(12,2) NOT NULL,
    "aplicaIVA" BOOLEAN NOT NULL DEFAULT false,
    "montoIVA" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(12,2) NOT NULL,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "facturaId" TEXT NOT NULL,
    "conceptoId" TEXT NOT NULL,

    CONSTRAINT "items_factura_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solicitudes_pago" (
    "id" TEXT NOT NULL,
    "codigoSolicitud" TEXT NOT NULL,
    "codigoBarras" TEXT NOT NULL,
    "codigoQR" TEXT NOT NULL,
    "monto" DECIMAL(12,2) NOT NULL,
    "estado" "EstadoSolicitudPago" NOT NULL DEFAULT 'PENDIENTE',
    "fechaVencimiento" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "facturaId" TEXT NOT NULL,

    CONSTRAINT "solicitudes_pago_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "intenciones_pago" (
    "id" TEXT NOT NULL,
    "referenciaBancaria" TEXT,
    "metodoPago" TEXT,
    "estado" "EstadoIntencionPago" NOT NULL DEFAULT 'INICIADA',
    "respuestaAPI" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "solicitudPagoId" TEXT NOT NULL,
    "creadoPorId" TEXT NOT NULL,

    CONSTRAINT "intenciones_pago_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pagos" (
    "id" TEXT NOT NULL,
    "monto" DECIMAL(12,2) NOT NULL,
    "fechaPago" TIMESTAMP(3) NOT NULL,
    "tipoPago" "TipoPago" NOT NULL,
    "referencia" TEXT,
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "proveedorPagoId" TEXT,
    "referenciaExterna" TEXT,
    "estadoProveedorPago" TEXT,
    "respuestaProveedorPago" JSONB,
    "comisionProveedor" DECIMAL(12,2),
    "facturaId" TEXT NOT NULL,
    "solicitudPagoId" TEXT,
    "registradoPorId" TEXT NOT NULL,

    CONSTRAINT "pagos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zonas" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "descripcion" TEXT,
    "coordenadas" JSONB,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cooperativaId" TEXT NOT NULL,

    CONSTRAINT "zonas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operaciones" (
    "id" TEXT NOT NULL,
    "tipo" "TipoOperacion" NOT NULL,
    "estado" "EstadoOperacion" NOT NULL DEFAULT 'PROGRAMADA',
    "prioridad" "PrioridadOperacion" NOT NULL DEFAULT 'MEDIA',
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "observaciones" TEXT,
    "fechaProgramada" TIMESTAMP(3),
    "fechaInicio" TIMESTAMP(3),
    "fechaFinalizacion" TIMESTAMP(3),
    "direccion" TEXT,
    "coordenadasGPS" JSONB,
    "costoEstimado" DECIMAL(12,2),
    "costoReal" DECIMAL(12,2),
    "materialesUsados" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cooperativaId" TEXT NOT NULL,
    "zonaId" TEXT,
    "cuentaId" TEXT,
    "cuentaServicioId" TEXT,
    "medidorId" TEXT,
    "asignadoAId" TEXT,
    "creadoPorId" TEXT NOT NULL,

    CONSTRAINT "operaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "adjuntos_operaciones" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipoArchivo" TEXT NOT NULL,
    "urlArchivo" TEXT NOT NULL,
    "tamano" INTEGER,
    "descripcion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "operacionId" TEXT NOT NULL,
    "subidoPorId" TEXT NOT NULL,

    CONSTRAINT "adjuntos_operaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historial_operaciones" (
    "id" TEXT NOT NULL,
    "estadoAnterior" "EstadoOperacion",
    "estadoNuevo" "EstadoOperacion" NOT NULL,
    "comentario" TEXT,
    "cambiosJSON" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "operacionId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,

    CONSTRAINT "historial_operaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categorias_reportes" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "descripcion" TEXT,
    "icono" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cooperativaId" TEXT NOT NULL,

    CONSTRAINT "categorias_reportes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plantillas_reportes" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "descripcion" TEXT,
    "tipo" "TipoReporte" NOT NULL,
    "querySQL" TEXT,
    "parametrosConfig" JSONB,
    "columnasConfig" JSONB,
    "agregacionesConfig" JSONB,
    "formatosPorDefecto" "FormatoExportacion"[],
    "requiereAprobacion" BOOLEAN NOT NULL DEFAULT false,
    "esPublico" BOOLEAN NOT NULL DEFAULT false,
    "esSistema" BOOLEAN NOT NULL DEFAULT false,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cooperativaId" TEXT NOT NULL,
    "categoriaId" TEXT,
    "creadoPorId" TEXT,

    CONSTRAINT "plantillas_reportes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reportes" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT,
    "tipo" "TipoReporte" NOT NULL,
    "formato" "FormatoExportacion" NOT NULL,
    "estado" "EstadoReporte" NOT NULL DEFAULT 'SOLICITADO',
    "parametrosUsados" JSONB,
    "filtrosAplicados" JSONB,
    "queryEjecutada" TEXT NOT NULL,
    "cantidadRegistros" INTEGER,
    "urlArchivoGenerado" TEXT,
    "nombreArchivo" TEXT,
    "tamanoArchivo" INTEGER,
    "hashArchivo" TEXT,
    "ipSolicitud" TEXT,
    "userAgent" TEXT,
    "fechaSolicitud" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaInicioProceso" TIMESTAMP(3),
    "fechaCompletado" TIMESTAMP(3),
    "tiempoEjecucionMs" INTEGER,
    "mensajeError" TEXT,
    "stackTrace" TEXT,
    "vecesDescargado" INTEGER NOT NULL DEFAULT 0,
    "ultimaDescarga" TIMESTAMP(3),
    "fechaExpiracion" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cooperativaId" TEXT NOT NULL,
    "plantillaId" TEXT,
    "solicitadoPorId" TEXT NOT NULL,
    "aprobadoPorId" TEXT,

    CONSTRAINT "reportes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "descargas_reportes" (
    "id" TEXT NOT NULL,
    "fechaDescarga" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipDescarga" TEXT,
    "userAgent" TEXT,
    "reporteId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,

    CONSTRAINT "descargas_reportes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reportes_compartidos" (
    "id" TEXT NOT NULL,
    "mensaje" TEXT,
    "puedeDescargar" BOOLEAN NOT NULL DEFAULT true,
    "fechaExpiracion" TIMESTAMP(3),
    "fechaCompartido" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reporteId" TEXT NOT NULL,
    "compartidoPorId" TEXT NOT NULL,
    "compartidoConId" TEXT NOT NULL,

    CONSTRAINT "reportes_compartidos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logs_consultas_directas" (
    "id" TEXT NOT NULL,
    "queryEjecutada" TEXT NOT NULL,
    "tipoOperacion" TEXT NOT NULL,
    "tablasPrincipales" TEXT[],
    "registrosAfectados" INTEGER,
    "tiempoEjecucionMs" INTEGER,
    "ipOrigen" TEXT,
    "userAgent" TEXT,
    "contexto" TEXT,
    "exitoso" BOOLEAN NOT NULL DEFAULT true,
    "mensajeError" TEXT,
    "fechaEjecucion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cooperativaId" TEXT NOT NULL,
    "ejecutadoPorId" TEXT NOT NULL,

    CONSTRAINT "logs_consultas_directas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuraciones_retencion_datos" (
    "id" TEXT NOT NULL,
    "diasRetencionReportes" INTEGER NOT NULL DEFAULT 90,
    "diasRetencionLogs" INTEGER NOT NULL DEFAULT 180,
    "maxReportesPorUsuarioDia" INTEGER NOT NULL DEFAULT 50,
    "maxReportesPorUsuarioMes" INTEGER NOT NULL DEFAULT 500,
    "maxTamanoArchivoMB" INTEGER NOT NULL DEFAULT 100,
    "notificarExportaciones" BOOLEAN NOT NULL DEFAULT true,
    "notificarExportacionesMasivas" BOOLEAN NOT NULL DEFAULT true,
    "umbralExportacionMasiva" INTEGER NOT NULL DEFAULT 10000,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cooperativaId" TEXT NOT NULL,

    CONSTRAINT "configuraciones_retencion_datos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "legajos" (
    "id" TEXT NOT NULL,
    "numeroLegajo" TEXT NOT NULL,
    "estado" "EstadoLegajo" NOT NULL DEFAULT 'ACTIVO',
    "fechaApertura" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaCierre" TIMESTAMP(3),
    "observaciones" TEXT,
    "ubicacionArchivo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cooperativaId" TEXT NOT NULL,
    "inmuebleId" TEXT NOT NULL,
    "creadoPorId" TEXT NOT NULL,

    CONSTRAINT "legajos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transferencias_titularidad" (
    "id" TEXT NOT NULL,
    "numeroTransferencia" TEXT NOT NULL,
    "motivo" "MotivoTransferencia" NOT NULL,
    "descripcionMotivo" TEXT,
    "fechaTransferencia" TIMESTAMP(3) NOT NULL,
    "fechaRegistro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "titularAnteriorId" TEXT NOT NULL,
    "titularNuevoId" TEXT NOT NULL,
    "valorTransferencia" DECIMAL(12,2),
    "moneda" TEXT DEFAULT 'ARS',
    "escribania" TEXT,
    "numeroEscritura" TEXT,
    "folioRegistro" TEXT,
    "verificado" BOOLEAN NOT NULL DEFAULT false,
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "legajoId" TEXT NOT NULL,
    "registradoPorId" TEXT NOT NULL,
    "verificadoPorId" TEXT,

    CONSTRAINT "transferencias_titularidad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documentos_legajo" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipoDocumento" "TipoDocumentoLegajo" NOT NULL,
    "descripcion" TEXT,
    "nombreArchivo" TEXT NOT NULL,
    "urlArchivo" TEXT NOT NULL,
    "tipoMIME" TEXT NOT NULL,
    "tamanoBytes" INTEGER NOT NULL,
    "hashArchivo" TEXT NOT NULL,
    "numeroDocumento" TEXT,
    "fechaDocumento" TIMESTAMP(3),
    "fechaVencimiento" TIMESTAMP(3),
    "calidadEscaneo" TEXT,
    "requiereOriginal" BOOLEAN NOT NULL DEFAULT false,
    "validado" BOOLEAN NOT NULL DEFAULT false,
    "fechaValidacion" TIMESTAMP(3),
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "legajoId" TEXT NOT NULL,
    "subidoPorId" TEXT NOT NULL,
    "validadoPorId" TEXT,

    CONSTRAINT "documentos_legajo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documentos_transferencia" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipoDocumento" "TipoDocumentoLegajo" NOT NULL,
    "descripcion" TEXT,
    "nombreArchivo" TEXT NOT NULL,
    "urlArchivo" TEXT NOT NULL,
    "tipoMIME" TEXT NOT NULL,
    "tamanoBytes" INTEGER NOT NULL,
    "hashArchivo" TEXT NOT NULL,
    "numeroDocumento" TEXT,
    "fechaDocumento" TIMESTAMP(3),
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "transferenciaId" TEXT NOT NULL,
    "subidoPorId" TEXT NOT NULL,

    CONSTRAINT "documentos_transferencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "anotaciones_legajo" (
    "id" TEXT NOT NULL,
    "titulo" TEXT,
    "contenido" TEXT NOT NULL,
    "importante" BOOLEAN NOT NULL DEFAULT false,
    "fechaAnotacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "legajoId" TEXT NOT NULL,
    "anotadoPorId" TEXT NOT NULL,

    CONSTRAINT "anotaciones_legajo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historial_titularidad_view" (
    "id" TEXT NOT NULL,
    "inmuebleId" TEXT NOT NULL,
    "legajoId" TEXT NOT NULL,
    "titularId" TEXT NOT NULL,
    "nombreTitular" TEXT NOT NULL,
    "documentoTitular" TEXT NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3),
    "esActual" BOOLEAN NOT NULL,
    "motivoCambio" "MotivoTransferencia",
    "transferenciaId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historial_titularidad_view_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuraciones_legajos" (
    "id" TEXT NOT NULL,
    "prefijoLegajo" TEXT NOT NULL DEFAULT 'LEG',
    "prefijoTransferencia" TEXT NOT NULL DEFAULT 'TRANS',
    "requiereValidacionDocumentos" BOOLEAN NOT NULL DEFAULT true,
    "requiereDobleVerificacion" BOOLEAN NOT NULL DEFAULT false,
    "directorioBase" TEXT NOT NULL DEFAULT '/legajos',
    "maxTamanoArchivoMB" INTEGER NOT NULL DEFAULT 50,
    "formatosPermitidos" TEXT[] DEFAULT ARRAY['pdf', 'jpg', 'jpeg', 'png', 'tiff']::TEXT[],
    "diasRetencionArchivados" INTEGER NOT NULL DEFAULT 3650,
    "notificarTransferencias" BOOLEAN NOT NULL DEFAULT true,
    "notificarVencimientos" BOOLEAN NOT NULL DEFAULT true,
    "diasAvisoVencimiento" INTEGER NOT NULL DEFAULT 30,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cooperativaId" TEXT NOT NULL,

    CONSTRAINT "configuraciones_legajos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuraciones_onboarding" (
    "id" TEXT NOT NULL,
    "activado" BOOLEAN NOT NULL DEFAULT true,
    "requiereAprobacionManual" BOOLEAN NOT NULL DEFAULT false,
    "tiempoLimiteOnboarding" INTEGER NOT NULL DEFAULT 30,
    "pasosObligatorios" TEXT[] DEFAULT ARRAY['DATOS_PERSONALES', 'DOCUMENTACION', 'ACEPTACION_TERMINOS']::TEXT[],
    "pasosOpcionales" TEXT[] DEFAULT ARRAY['CONFIGURACION_SERVICIOS', 'ENCUESTA_BIENVENIDA']::TEXT[],
    "documentosRequeridos" TEXT[] DEFAULT ARRAY['DNI', 'COMPROBANTE_DOMICILIO']::TEXT[],
    "documentosOpcionales" TEXT[] DEFAULT ARRAY['COMPROBANTE_INGRESOS']::TEXT[],
    "requiereValidacionEmail" BOOLEAN NOT NULL DEFAULT true,
    "requiereValidacionTelefono" BOOLEAN NOT NULL DEFAULT false,
    "requiereValidacionDomicilio" BOOLEAN NOT NULL DEFAULT true,
    "emailBienvenida" TEXT,
    "emailRecordatorio" TEXT,
    "diasRecordatorio" INTEGER NOT NULL DEFAULT 7,
    "maxRecordatorios" INTEGER NOT NULL DEFAULT 3,
    "emailAprobacion" TEXT,
    "emailRechazo" TEXT,
    "integrarConSistemaContable" BOOLEAN NOT NULL DEFAULT false,
    "integrarConCRM" BOOLEAN NOT NULL DEFAULT false,
    "crearCuentaAutomatica" BOOLEAN NOT NULL DEFAULT true,
    "asignarServiciosBasicos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cooperativaId" TEXT NOT NULL,

    CONSTRAINT "configuraciones_onboarding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "procesos_onboarding" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "telefono" TEXT,
    "documento" TEXT NOT NULL,
    "tipoDocumento" "TipoDocumento" NOT NULL DEFAULT 'DNI',
    "fechaNacimiento" TIMESTAMP(3),
    "domicilio" TEXT,
    "localidad" TEXT,
    "provincia" TEXT,
    "codigoPostal" TEXT,
    "estado" "EstadoOnboarding" NOT NULL DEFAULT 'INICIADO',
    "fechaInicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaUltimaActividad" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaFinalizacion" TIMESTAMP(3),
    "fechaVencimiento" TIMESTAMP(3),
    "pasoActual" TEXT NOT NULL DEFAULT 'DATOS_PERSONALES',
    "pasosCompletados" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "pasosPendientes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "emailValidado" BOOLEAN NOT NULL DEFAULT false,
    "telefonoValidado" BOOLEAN NOT NULL DEFAULT false,
    "domicilioValidado" BOOLEAN NOT NULL DEFAULT false,
    "requiereAprobacion" BOOLEAN NOT NULL DEFAULT false,
    "fechaAprobacion" TIMESTAMP(3),
    "usuarioAprobadorId" TEXT,
    "motivoRechazo" TEXT,
    "observacionesInternas" TEXT,
    "ipRegistro" TEXT,
    "userAgent" TEXT,
    "origenSolicitud" TEXT,
    "codigoReferencia" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cooperativaId" TEXT NOT NULL,
    "usuarioCreadoId" TEXT,

    CONSTRAINT "procesos_onboarding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reglas_onboarding" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "tipoRegla" "TipoReglaOnboarding" NOT NULL,
    "condiciones" JSONB NOT NULL,
    "acciones" JSONB NOT NULL,
    "parametros" JSONB,
    "ejecutarEn" "EtapaOnboarding"[] DEFAULT ARRAY['VALIDACION']::"EtapaOnboarding"[],
    "esCritica" BOOLEAN NOT NULL DEFAULT false,
    "esAsincrona" BOOLEAN NOT NULL DEFAULT false,
    "permiteReintentos" BOOLEAN NOT NULL DEFAULT true,
    "maxReintentos" INTEGER NOT NULL DEFAULT 3,
    "tiempoEsperaMins" INTEGER NOT NULL DEFAULT 5,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cooperativaId" TEXT NOT NULL,

    CONSTRAINT "reglas_onboarding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documentos_onboarding" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipoDocumento" TEXT NOT NULL,
    "descripcion" TEXT,
    "esObligatorio" BOOLEAN NOT NULL DEFAULT true,
    "nombreArchivo" TEXT NOT NULL,
    "rutaArchivo" TEXT NOT NULL,
    "tamanoBytes" INTEGER NOT NULL,
    "tipoMime" TEXT NOT NULL,
    "hashArchivo" TEXT,
    "estado" "EstadoDocumento" NOT NULL DEFAULT 'PENDIENTE',
    "fechaSubida" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaValidacion" TIMESTAMP(3),
    "observaciones" TEXT,
    "validadoPor" TEXT,
    "requiereReenvio" BOOLEAN NOT NULL DEFAULT false,
    "motivoRechazo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "procesoOnboardingId" TEXT NOT NULL,

    CONSTRAINT "documentos_onboarding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pasos_onboarding" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "orden" INTEGER NOT NULL,
    "esObligatorio" BOOLEAN NOT NULL DEFAULT true,
    "estado" "EstadoPaso" NOT NULL DEFAULT 'PENDIENTE',
    "fechaInicio" TIMESTAMP(3),
    "fechaCompletado" TIMESTAMP(3),
    "intentosRealizados" INTEGER NOT NULL DEFAULT 0,
    "maxIntentos" INTEGER NOT NULL DEFAULT 3,
    "datosEntrada" JSONB,
    "datosSalida" JSONB,
    "configuracion" JSONB,
    "requiereValidacion" BOOLEAN NOT NULL DEFAULT false,
    "validadoPor" TEXT,
    "fechaValidacion" TIMESTAMP(3),
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "procesoOnboardingId" TEXT NOT NULL,

    CONSTRAINT "pasos_onboarding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "validaciones_onboarding" (
    "id" TEXT NOT NULL,
    "tipoValidacion" "TipoValidacion" NOT NULL,
    "campo" TEXT NOT NULL,
    "valor" TEXT NOT NULL,
    "estado" "EstadoValidacion" NOT NULL DEFAULT 'PENDIENTE',
    "esValido" BOOLEAN NOT NULL DEFAULT false,
    "fechaValidacion" TIMESTAMP(3),
    "motivoRechazo" TEXT,
    "datosValidacion" JSONB,
    "intentos" INTEGER NOT NULL DEFAULT 0,
    "permiteReintentos" BOOLEAN NOT NULL DEFAULT true,
    "proximoIntento" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "procesoOnboardingId" TEXT NOT NULL,

    CONSTRAINT "validaciones_onboarding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comunicaciones_onboarding" (
    "id" TEXT NOT NULL,
    "tipoComunicacion" "TipoComunicacion" NOT NULL,
    "canal" "CanalComunicacion" NOT NULL,
    "destinatario" TEXT NOT NULL,
    "asunto" TEXT,
    "mensaje" TEXT NOT NULL,
    "plantilla" TEXT,
    "estado" "EstadoComunicacion" NOT NULL DEFAULT 'PENDIENTE',
    "fechaEnvio" TIMESTAMP(3),
    "fechaLectura" TIMESTAMP(3),
    "intentos" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "respuesta" TEXT,
    "fechaRespuesta" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "procesoOnboardingId" TEXT NOT NULL,

    CONSTRAINT "comunicaciones_onboarding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resultados_reglas_onboarding" (
    "id" TEXT NOT NULL,
    "fechaEjecucion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" "EstadoEjecucionRegla" NOT NULL,
    "tiempo" INTEGER,
    "exitosa" BOOLEAN NOT NULL,
    "mensaje" TEXT,
    "datosResultado" JSONB,
    "error" TEXT,
    "intento" INTEGER NOT NULL DEFAULT 1,
    "proximoIntento" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "procesoOnboardingId" TEXT NOT NULL,
    "reglaOnboardingId" TEXT NOT NULL,

    CONSTRAINT "resultados_reglas_onboarding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proveedores_pago" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "tipo" "TipoProveedorPago" NOT NULL,
    "descripcion" TEXT,
    "logoUrl" TEXT,
    "sitioWeb" TEXT,
    "apiBaseUrl" TEXT,
    "versionApi" TEXT,
    "documentacionUrl" TEXT,
    "soportaWebhooks" BOOLEAN NOT NULL DEFAULT false,
    "soportaTarjetas" BOOLEAN NOT NULL DEFAULT true,
    "soportaTransferencias" BOOLEAN NOT NULL DEFAULT false,
    "soportaEfectivo" BOOLEAN NOT NULL DEFAULT false,
    "soportaRecurrentes" BOOLEAN NOT NULL DEFAULT false,
    "montoMinimo" DECIMAL(12,2),
    "montoMaximo" DECIMAL(12,2),
    "comisionPorcentaje" DECIMAL(5,4),
    "comisionFija" DECIMAL(12,2),
    "tiempoExpiracionMinutos" INTEGER NOT NULL DEFAULT 60,
    "tiempoConfirmacionHoras" INTEGER NOT NULL DEFAULT 72,
    "paisesDisponibles" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "monedasSoportadas" TEXT[] DEFAULT ARRAY['ARS']::TEXT[],
    "estado" "EstadoProveedorPago" NOT NULL DEFAULT 'ACTIVO',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "proveedores_pago_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proveedores_pago_cooperativas" (
    "id" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "esPrincipal" BOOLEAN NOT NULL DEFAULT false,
    "tokenAcceso" TEXT NOT NULL,
    "tokenRefresh" TEXT,
    "clavePublica" TEXT,
    "clavePrivada" TEXT,
    "entornoPruebas" BOOLEAN NOT NULL DEFAULT true,
    "webhookUrl" TEXT,
    "webhookSecret" TEXT,
    "configuracionPersonalizada" JSONB,
    "montoMinimo" DECIMAL(12,2),
    "montoMaximo" DECIMAL(12,2),
    "comisionAdicional" DECIMAL(5,4),
    "fechaIntegracion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaUltimaConexion" TIMESTAMP(3),
    "estadoConexion" TEXT NOT NULL DEFAULT 'NO_VERIFICADO',
    "ultimoErrorConexion" TEXT,
    "totalTransacciones" INTEGER NOT NULL DEFAULT 0,
    "montoTotalProcesado" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "ultimaTransaccion" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cooperativaId" TEXT NOT NULL,
    "proveedorPagoId" TEXT NOT NULL,

    CONSTRAINT "proveedores_pago_cooperativas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuraciones_suscripcion" (
    "id" TEXT NOT NULL,
    "porcentajeComision" DECIMAL(5,4) NOT NULL,
    "comisionMinima" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "comisionMaxima" DECIMAL(12,2),
    "diaGeneracionFactura" INTEGER NOT NULL DEFAULT 1,
    "diasVencimientoFactura" INTEGER NOT NULL DEFAULT 30,
    "incluyeIVA" BOOLEAN NOT NULL DEFAULT true,
    "porcentajeIVA" DECIMAL(5,2) NOT NULL DEFAULT 21,
    "fechaInicioSuscripcion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaFinSuscripcion" TIMESTAMP(3),
    "observaciones" TEXT,
    "notificarGeneracionFactura" BOOLEAN NOT NULL DEFAULT true,
    "notificarVencimientoFactura" BOOLEAN NOT NULL DEFAULT true,
    "diasAvisoVencimiento" INTEGER NOT NULL DEFAULT 7,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "fechaUltimModificacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modificadoPorSuperAdmin" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cooperativaId" TEXT NOT NULL,

    CONSTRAINT "configuraciones_suscripcion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historial_configuraciones_suscripcion" (
    "id" TEXT NOT NULL,
    "campoModificado" TEXT NOT NULL,
    "valorAnterior" TEXT NOT NULL,
    "valorNuevo" TEXT NOT NULL,
    "motivo" TEXT,
    "fechaCambio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "realizadoPorSuperAdmin" TEXT NOT NULL,
    "aprobadoPorSuperAdmin" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "configuracionId" TEXT NOT NULL,

    CONSTRAINT "historial_configuraciones_suscripcion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solicitudes_cambio_comision" (
    "id" TEXT NOT NULL,
    "porcentajeComisionActual" DECIMAL(5,4) NOT NULL,
    "porcentajeComisionSolicitado" DECIMAL(5,4) NOT NULL,
    "motivo" TEXT NOT NULL,
    "justificacion" TEXT,
    "documentosAdjuntos" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "volumenMensualPromedio" DECIMAL(15,2),
    "cantidadPagosPromedio" INTEGER,
    "tiempoComoCiente" INTEGER,
    "proyeccionCrecimiento" DECIMAL(5,2),
    "estado" "EstadoSolicitudComision" NOT NULL DEFAULT 'PENDIENTE',
    "fechaSolicitud" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaRevision" TIMESTAMP(3),
    "fechaResolucion" TIMESTAMP(3),
    "respuestaSuperAdmin" TEXT,
    "porcentajeComisionAprobado" DECIMAL(5,4),
    "fechaInicioNuevaComision" TIMESTAMP(3),
    "revisadoPorSuperAdmin" TEXT,
    "aprobadoPorSuperAdmin" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "configuracionId" TEXT NOT NULL,

    CONSTRAINT "solicitudes_cambio_comision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suscripciones_facturas" (
    "id" TEXT NOT NULL,
    "mes" INTEGER NOT NULL,
    "anio" INTEGER NOT NULL,
    "periodo" TEXT NOT NULL,
    "fechaGeneracion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaVencimiento" TIMESTAMP(3) NOT NULL,
    "fechaAprobacion" TIMESTAMP(3),
    "fechaPago" TIMESTAMP(3),
    "cantidadPagos" INTEGER NOT NULL,
    "montoTotalPagos" DECIMAL(15,2) NOT NULL,
    "porcentajeComision" DECIMAL(5,4) NOT NULL,
    "subtotalComision" DECIMAL(12,2) NOT NULL,
    "montoIVA" DECIMAL(12,2) NOT NULL,
    "totalFactura" DECIMAL(12,2) NOT NULL,
    "estado" "EstadoSuscripcionFactura" NOT NULL DEFAULT 'GENERADA',
    "tipoPago" "TipoPagoSuscripcion",
    "referenciaPago" TEXT,
    "observaciones" TEXT,
    "observacionesPago" TEXT,
    "generadoPorSistema" BOOLEAN NOT NULL DEFAULT true,
    "aprobadoPorSuperAdmin" TEXT,
    "marcadoPagadoPor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "configuracionId" TEXT NOT NULL,

    CONSTRAINT "suscripciones_facturas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuraciones_datos_bancarios" (
    "id" TEXT NOT NULL,
    "nombreCuenta" TEXT NOT NULL,
    "nombreBanco" TEXT NOT NULL,
    "cbu" TEXT NOT NULL,
    "alias" TEXT,
    "numeroCuenta" TEXT,
    "tipoCuenta" TEXT,
    "sucursal" TEXT,
    "razonSocialTitular" TEXT NOT NULL,
    "cuitTitular" TEXT NOT NULL,
    "domicilioFiscal" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "esPrincipal" BOOLEAN NOT NULL DEFAULT true,
    "instruccionesPago" TEXT,
    "horarioAtencion" TEXT,
    "emailContacto" TEXT,
    "telefonoContacto" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "creadoPorSuperAdmin" TEXT NOT NULL,
    "modificadoPorSuperAdmin" TEXT,

    CONSTRAINT "configuraciones_datos_bancarios_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cooperativas_cuit_key" ON "cooperativas"("cuit");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE INDEX "usuarios_email_idx" ON "usuarios"("email");

-- CreateIndex
CREATE INDEX "usuarios_cooperativas_usuarioId_idx" ON "usuarios_cooperativas"("usuarioId");

-- CreateIndex
CREATE INDEX "usuarios_cooperativas_cooperativaId_idx" ON "usuarios_cooperativas"("cooperativaId");

-- CreateIndex
CREATE INDEX "usuarios_cooperativas_personaId_idx" ON "usuarios_cooperativas"("personaId");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_cooperativas_usuarioId_cooperativaId_key" ON "usuarios_cooperativas"("usuarioId", "cooperativaId");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_replacedByTokenId_key" ON "refresh_tokens"("replacedByTokenId");

-- CreateIndex
CREATE INDEX "refresh_tokens_usuarioId_idx" ON "refresh_tokens"("usuarioId");

-- CreateIndex
CREATE INDEX "refresh_tokens_token_idx" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_expiresAt_idx" ON "refresh_tokens"("expiresAt");

-- CreateIndex
CREATE INDEX "refresh_tokens_isRevoked_idx" ON "refresh_tokens"("isRevoked");

-- CreateIndex
CREATE INDEX "roles_cooperativaId_idx" ON "roles"("cooperativaId");

-- CreateIndex
CREATE UNIQUE INDEX "roles_cooperativaId_nombre_key" ON "roles"("cooperativaId", "nombre");

-- CreateIndex
CREATE INDEX "usuarios_roles_usuarioCooperativaId_idx" ON "usuarios_roles"("usuarioCooperativaId");

-- CreateIndex
CREATE INDEX "usuarios_roles_rolId_idx" ON "usuarios_roles"("rolId");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_roles_usuarioCooperativaId_rolId_key" ON "usuarios_roles"("usuarioCooperativaId", "rolId");

-- CreateIndex
CREATE INDEX "secciones_sistema_cooperativaId_idx" ON "secciones_sistema"("cooperativaId");

-- CreateIndex
CREATE UNIQUE INDEX "secciones_sistema_cooperativaId_codigo_key" ON "secciones_sistema"("cooperativaId", "codigo");

-- CreateIndex
CREATE INDEX "roles_permisos_rolId_idx" ON "roles_permisos"("rolId");

-- CreateIndex
CREATE INDEX "roles_permisos_seccionId_idx" ON "roles_permisos"("seccionId");

-- CreateIndex
CREATE UNIQUE INDEX "roles_permisos_rolId_seccionId_accion_key" ON "roles_permisos"("rolId", "seccionId", "accion");

-- CreateIndex
CREATE UNIQUE INDEX "personas_numeroSocio_key" ON "personas"("numeroSocio");

-- CreateIndex
CREATE INDEX "personas_cooperativaId_idx" ON "personas"("cooperativaId");

-- CreateIndex
CREATE INDEX "personas_numeroDocumento_idx" ON "personas"("numeroDocumento");

-- CreateIndex
CREATE INDEX "personas_estadoKYC_idx" ON "personas"("estadoKYC");

-- CreateIndex
CREATE INDEX "personas_estadoSocio_idx" ON "personas"("estadoSocio");

-- CreateIndex
CREATE INDEX "personas_numeroSocio_idx" ON "personas"("numeroSocio");

-- CreateIndex
CREATE UNIQUE INDEX "personas_cooperativaId_tipoDocumento_numeroDocumento_key" ON "personas"("cooperativaId", "tipoDocumento", "numeroDocumento");

-- CreateIndex
CREATE UNIQUE INDEX "personas_cooperativaId_numeroSocio_key" ON "personas"("cooperativaId", "numeroSocio");

-- CreateIndex
CREATE INDEX "documentos_kyc_personaId_idx" ON "documentos_kyc"("personaId");

-- CreateIndex
CREATE INDEX "documentos_kyc_tipoDocumento_idx" ON "documentos_kyc"("tipoDocumento");

-- CreateIndex
CREATE INDEX "documentos_kyc_validado_idx" ON "documentos_kyc"("validado");

-- CreateIndex
CREATE INDEX "historial_estado_kyc_personaId_fechaCambio_idx" ON "historial_estado_kyc"("personaId", "fechaCambio");

-- CreateIndex
CREATE UNIQUE INDEX "solicitudes_reset_password_token_key" ON "solicitudes_reset_password"("token");

-- CreateIndex
CREATE INDEX "solicitudes_reset_password_token_idx" ON "solicitudes_reset_password"("token");

-- CreateIndex
CREATE INDEX "solicitudes_reset_password_personaId_idx" ON "solicitudes_reset_password"("personaId");

-- CreateIndex
CREATE INDEX "solicitudes_reset_password_fechaExpira_idx" ON "solicitudes_reset_password"("fechaExpira");

-- CreateIndex
CREATE INDEX "notificaciones_personas_personaId_tipo_idx" ON "notificaciones_personas"("personaId", "tipo");

-- CreateIndex
CREATE INDEX "notificaciones_personas_categoria_idx" ON "notificaciones_personas"("categoria");

-- CreateIndex
CREATE INDEX "notificaciones_personas_enviado_fechaEnvio_idx" ON "notificaciones_personas"("enviado", "fechaEnvio");

-- CreateIndex
CREATE INDEX "inmuebles_titularInmuebleId_idx" ON "inmuebles"("titularInmuebleId");

-- CreateIndex
CREATE INDEX "servicios_disponibles_cooperativaId_idx" ON "servicios_disponibles"("cooperativaId");

-- CreateIndex
CREATE UNIQUE INDEX "servicios_disponibles_cooperativaId_codigo_key" ON "servicios_disponibles"("cooperativaId", "codigo");

-- CreateIndex
CREATE INDEX "categorias_consumo_cooperativaId_idx" ON "categorias_consumo"("cooperativaId");

-- CreateIndex
CREATE INDEX "categorias_consumo_servicioId_idx" ON "categorias_consumo"("servicioId");

-- CreateIndex
CREATE UNIQUE INDEX "categorias_consumo_servicioId_codigo_key" ON "categorias_consumo"("servicioId", "codigo");

-- CreateIndex
CREATE INDEX "historial_precios_categorias_categoriaId_idx" ON "historial_precios_categorias"("categoriaId");

-- CreateIndex
CREATE INDEX "historial_precios_categorias_mes_anio_idx" ON "historial_precios_categorias"("mes", "anio");

-- CreateIndex
CREATE INDEX "cuentas_cooperativaId_idx" ON "cuentas"("cooperativaId");

-- CreateIndex
CREATE INDEX "cuentas_titularServicioId_idx" ON "cuentas"("titularServicioId");

-- CreateIndex
CREATE INDEX "cuentas_inmuebleId_idx" ON "cuentas"("inmuebleId");

-- CreateIndex
CREATE UNIQUE INDEX "cuentas_cooperativaId_numeroCuenta_key" ON "cuentas"("cooperativaId", "numeroCuenta");

-- CreateIndex
CREATE INDEX "cuentas_servicios_cuentaId_idx" ON "cuentas_servicios"("cuentaId");

-- CreateIndex
CREATE INDEX "cuentas_servicios_servicioId_idx" ON "cuentas_servicios"("servicioId");

-- CreateIndex
CREATE INDEX "cuentas_servicios_categoriaId_idx" ON "cuentas_servicios"("categoriaId");

-- CreateIndex
CREATE UNIQUE INDEX "cuentas_servicios_cuentaId_servicioId_key" ON "cuentas_servicios"("cuentaId", "servicioId");

-- CreateIndex
CREATE INDEX "medidores_numeroMedidor_idx" ON "medidores"("numeroMedidor");

-- CreateIndex
CREATE INDEX "medidores_cooperativaId_idx" ON "medidores"("cooperativaId");

-- CreateIndex
CREATE INDEX "medidores_inmuebleId_idx" ON "medidores"("inmuebleId");

-- CreateIndex
CREATE UNIQUE INDEX "medidores_cooperativaId_numeroMedidor_key" ON "medidores"("cooperativaId", "numeroMedidor");

-- CreateIndex
CREATE INDEX "lecturas_medidorId_idx" ON "lecturas"("medidorId");

-- CreateIndex
CREATE INDEX "lecturas_fechaLectura_idx" ON "lecturas"("fechaLectura");

-- CreateIndex
CREATE INDEX "lecturas_facturaId_idx" ON "lecturas"("facturaId");

-- CreateIndex
CREATE INDEX "lecturas_esPrincipal_idx" ON "lecturas"("esPrincipal");

-- CreateIndex
CREATE INDEX "lecturas_mes_anio_idx" ON "lecturas"("mes", "anio");

-- CreateIndex
CREATE INDEX "historial_vinculaciones_medidor_medidorId_idx" ON "historial_vinculaciones_medidor"("medidorId");

-- CreateIndex
CREATE INDEX "historial_vinculaciones_medidor_fechaOperacion_idx" ON "historial_vinculaciones_medidor"("fechaOperacion");

-- CreateIndex
CREATE INDEX "historial_vinculaciones_medidor_operadoPorId_idx" ON "historial_vinculaciones_medidor"("operadoPorId");

-- CreateIndex
CREATE INDEX "conceptos_facturables_cooperativaId_idx" ON "conceptos_facturables"("cooperativaId");

-- CreateIndex
CREATE INDEX "conceptos_facturables_tipoConcepto_idx" ON "conceptos_facturables"("tipoConcepto");

-- CreateIndex
CREATE UNIQUE INDEX "conceptos_facturables_cooperativaId_codigo_key" ON "conceptos_facturables"("cooperativaId", "codigo");

-- CreateIndex
CREATE INDEX "historial_conceptos_conceptoId_idx" ON "historial_conceptos"("conceptoId");

-- CreateIndex
CREATE INDEX "historial_conceptos_vigenciaDesde_idx" ON "historial_conceptos"("vigenciaDesde");

-- CreateIndex
CREATE UNIQUE INDEX "facturas_numeroFactura_key" ON "facturas"("numeroFactura");

-- CreateIndex
CREATE INDEX "facturas_cuentaId_idx" ON "facturas"("cuentaId");

-- CreateIndex
CREATE INDEX "facturas_cuentaServicioId_idx" ON "facturas"("cuentaServicioId");

-- CreateIndex
CREATE INDEX "facturas_estado_idx" ON "facturas"("estado");

-- CreateIndex
CREATE INDEX "facturas_mes_anio_idx" ON "facturas"("mes", "anio");

-- CreateIndex
CREATE INDEX "facturas_fechaVencimiento_idx" ON "facturas"("fechaVencimiento");

-- CreateIndex
CREATE INDEX "items_factura_facturaId_idx" ON "items_factura"("facturaId");

-- CreateIndex
CREATE INDEX "items_factura_conceptoId_idx" ON "items_factura"("conceptoId");

-- CreateIndex
CREATE UNIQUE INDEX "solicitudes_pago_codigoSolicitud_key" ON "solicitudes_pago"("codigoSolicitud");

-- CreateIndex
CREATE INDEX "solicitudes_pago_facturaId_idx" ON "solicitudes_pago"("facturaId");

-- CreateIndex
CREATE INDEX "solicitudes_pago_estado_idx" ON "solicitudes_pago"("estado");

-- CreateIndex
CREATE INDEX "solicitudes_pago_codigoSolicitud_idx" ON "solicitudes_pago"("codigoSolicitud");

-- CreateIndex
CREATE UNIQUE INDEX "intenciones_pago_solicitudPagoId_key" ON "intenciones_pago"("solicitudPagoId");

-- CreateIndex
CREATE INDEX "intenciones_pago_solicitudPagoId_idx" ON "intenciones_pago"("solicitudPagoId");

-- CreateIndex
CREATE INDEX "intenciones_pago_estado_idx" ON "intenciones_pago"("estado");

-- CreateIndex
CREATE INDEX "pagos_facturaId_idx" ON "pagos"("facturaId");

-- CreateIndex
CREATE INDEX "pagos_solicitudPagoId_idx" ON "pagos"("solicitudPagoId");

-- CreateIndex
CREATE INDEX "pagos_fechaPago_idx" ON "pagos"("fechaPago");

-- CreateIndex
CREATE INDEX "pagos_proveedorPagoId_idx" ON "pagos"("proveedorPagoId");

-- CreateIndex
CREATE INDEX "pagos_referenciaExterna_idx" ON "pagos"("referenciaExterna");

-- CreateIndex
CREATE INDEX "zonas_cooperativaId_idx" ON "zonas"("cooperativaId");

-- CreateIndex
CREATE UNIQUE INDEX "zonas_cooperativaId_codigo_key" ON "zonas"("cooperativaId", "codigo");

-- CreateIndex
CREATE INDEX "operaciones_cooperativaId_idx" ON "operaciones"("cooperativaId");

-- CreateIndex
CREATE INDEX "operaciones_tipo_idx" ON "operaciones"("tipo");

-- CreateIndex
CREATE INDEX "operaciones_estado_idx" ON "operaciones"("estado");

-- CreateIndex
CREATE INDEX "operaciones_prioridad_idx" ON "operaciones"("prioridad");

-- CreateIndex
CREATE INDEX "operaciones_zonaId_idx" ON "operaciones"("zonaId");

-- CreateIndex
CREATE INDEX "operaciones_cuentaId_idx" ON "operaciones"("cuentaId");

-- CreateIndex
CREATE INDEX "operaciones_medidorId_idx" ON "operaciones"("medidorId");

-- CreateIndex
CREATE INDEX "operaciones_fechaProgramada_idx" ON "operaciones"("fechaProgramada");

-- CreateIndex
CREATE INDEX "operaciones_asignadoAId_idx" ON "operaciones"("asignadoAId");

-- CreateIndex
CREATE INDEX "adjuntos_operaciones_operacionId_idx" ON "adjuntos_operaciones"("operacionId");

-- CreateIndex
CREATE INDEX "historial_operaciones_operacionId_idx" ON "historial_operaciones"("operacionId");

-- CreateIndex
CREATE INDEX "historial_operaciones_createdAt_idx" ON "historial_operaciones"("createdAt");

-- CreateIndex
CREATE INDEX "categorias_reportes_cooperativaId_idx" ON "categorias_reportes"("cooperativaId");

-- CreateIndex
CREATE UNIQUE INDEX "categorias_reportes_cooperativaId_codigo_key" ON "categorias_reportes"("cooperativaId", "codigo");

-- CreateIndex
CREATE INDEX "plantillas_reportes_cooperativaId_idx" ON "plantillas_reportes"("cooperativaId");

-- CreateIndex
CREATE INDEX "plantillas_reportes_tipo_idx" ON "plantillas_reportes"("tipo");

-- CreateIndex
CREATE INDEX "plantillas_reportes_categoriaId_idx" ON "plantillas_reportes"("categoriaId");

-- CreateIndex
CREATE UNIQUE INDEX "plantillas_reportes_cooperativaId_codigo_key" ON "plantillas_reportes"("cooperativaId", "codigo");

-- CreateIndex
CREATE INDEX "reportes_cooperativaId_idx" ON "reportes"("cooperativaId");

-- CreateIndex
CREATE INDEX "reportes_tipo_idx" ON "reportes"("tipo");

-- CreateIndex
CREATE INDEX "reportes_estado_idx" ON "reportes"("estado");

-- CreateIndex
CREATE INDEX "reportes_solicitadoPorId_idx" ON "reportes"("solicitadoPorId");

-- CreateIndex
CREATE INDEX "reportes_fechaSolicitud_idx" ON "reportes"("fechaSolicitud");

-- CreateIndex
CREATE INDEX "reportes_plantillaId_idx" ON "reportes"("plantillaId");

-- CreateIndex
CREATE INDEX "descargas_reportes_reporteId_idx" ON "descargas_reportes"("reporteId");

-- CreateIndex
CREATE INDEX "descargas_reportes_usuarioId_idx" ON "descargas_reportes"("usuarioId");

-- CreateIndex
CREATE INDEX "descargas_reportes_fechaDescarga_idx" ON "descargas_reportes"("fechaDescarga");

-- CreateIndex
CREATE INDEX "reportes_compartidos_reporteId_idx" ON "reportes_compartidos"("reporteId");

-- CreateIndex
CREATE INDEX "reportes_compartidos_compartidoPorId_idx" ON "reportes_compartidos"("compartidoPorId");

-- CreateIndex
CREATE INDEX "reportes_compartidos_compartidoConId_idx" ON "reportes_compartidos"("compartidoConId");

-- CreateIndex
CREATE INDEX "logs_consultas_directas_cooperativaId_idx" ON "logs_consultas_directas"("cooperativaId");

-- CreateIndex
CREATE INDEX "logs_consultas_directas_ejecutadoPorId_idx" ON "logs_consultas_directas"("ejecutadoPorId");

-- CreateIndex
CREATE INDEX "logs_consultas_directas_fechaEjecucion_idx" ON "logs_consultas_directas"("fechaEjecucion");

-- CreateIndex
CREATE INDEX "logs_consultas_directas_tipoOperacion_idx" ON "logs_consultas_directas"("tipoOperacion");

-- CreateIndex
CREATE UNIQUE INDEX "configuraciones_retencion_datos_cooperativaId_key" ON "configuraciones_retencion_datos"("cooperativaId");

-- CreateIndex
CREATE UNIQUE INDEX "legajos_numeroLegajo_key" ON "legajos"("numeroLegajo");

-- CreateIndex
CREATE UNIQUE INDEX "legajos_inmuebleId_key" ON "legajos"("inmuebleId");

-- CreateIndex
CREATE INDEX "legajos_cooperativaId_idx" ON "legajos"("cooperativaId");

-- CreateIndex
CREATE INDEX "legajos_inmuebleId_idx" ON "legajos"("inmuebleId");

-- CreateIndex
CREATE INDEX "legajos_estado_idx" ON "legajos"("estado");

-- CreateIndex
CREATE INDEX "legajos_numeroLegajo_idx" ON "legajos"("numeroLegajo");

-- CreateIndex
CREATE INDEX "transferencias_titularidad_legajoId_idx" ON "transferencias_titularidad"("legajoId");

-- CreateIndex
CREATE INDEX "transferencias_titularidad_titularAnteriorId_idx" ON "transferencias_titularidad"("titularAnteriorId");

-- CreateIndex
CREATE INDEX "transferencias_titularidad_titularNuevoId_idx" ON "transferencias_titularidad"("titularNuevoId");

-- CreateIndex
CREATE INDEX "transferencias_titularidad_fechaTransferencia_idx" ON "transferencias_titularidad"("fechaTransferencia");

-- CreateIndex
CREATE INDEX "transferencias_titularidad_numeroTransferencia_idx" ON "transferencias_titularidad"("numeroTransferencia");

-- CreateIndex
CREATE INDEX "documentos_legajo_legajoId_idx" ON "documentos_legajo"("legajoId");

-- CreateIndex
CREATE INDEX "documentos_legajo_tipoDocumento_idx" ON "documentos_legajo"("tipoDocumento");

-- CreateIndex
CREATE INDEX "documentos_legajo_fechaDocumento_idx" ON "documentos_legajo"("fechaDocumento");

-- CreateIndex
CREATE INDEX "documentos_legajo_validado_idx" ON "documentos_legajo"("validado");

-- CreateIndex
CREATE INDEX "documentos_transferencia_transferenciaId_idx" ON "documentos_transferencia"("transferenciaId");

-- CreateIndex
CREATE INDEX "documentos_transferencia_tipoDocumento_idx" ON "documentos_transferencia"("tipoDocumento");

-- CreateIndex
CREATE INDEX "anotaciones_legajo_legajoId_idx" ON "anotaciones_legajo"("legajoId");

-- CreateIndex
CREATE INDEX "anotaciones_legajo_fechaAnotacion_idx" ON "anotaciones_legajo"("fechaAnotacion");

-- CreateIndex
CREATE INDEX "historial_titularidad_view_inmuebleId_idx" ON "historial_titularidad_view"("inmuebleId");

-- CreateIndex
CREATE INDEX "historial_titularidad_view_legajoId_idx" ON "historial_titularidad_view"("legajoId");

-- CreateIndex
CREATE INDEX "historial_titularidad_view_titularId_idx" ON "historial_titularidad_view"("titularId");

-- CreateIndex
CREATE INDEX "historial_titularidad_view_fechaInicio_idx" ON "historial_titularidad_view"("fechaInicio");

-- CreateIndex
CREATE UNIQUE INDEX "configuraciones_legajos_cooperativaId_key" ON "configuraciones_legajos"("cooperativaId");

-- CreateIndex
CREATE UNIQUE INDEX "configuraciones_onboarding_cooperativaId_key" ON "configuraciones_onboarding"("cooperativaId");

-- CreateIndex
CREATE UNIQUE INDEX "procesos_onboarding_codigoReferencia_key" ON "procesos_onboarding"("codigoReferencia");

-- CreateIndex
CREATE UNIQUE INDEX "procesos_onboarding_usuarioCreadoId_key" ON "procesos_onboarding"("usuarioCreadoId");

-- CreateIndex
CREATE INDEX "procesos_onboarding_cooperativaId_idx" ON "procesos_onboarding"("cooperativaId");

-- CreateIndex
CREATE INDEX "procesos_onboarding_email_idx" ON "procesos_onboarding"("email");

-- CreateIndex
CREATE INDEX "procesos_onboarding_documento_idx" ON "procesos_onboarding"("documento");

-- CreateIndex
CREATE INDEX "procesos_onboarding_estado_idx" ON "procesos_onboarding"("estado");

-- CreateIndex
CREATE INDEX "procesos_onboarding_fechaInicio_idx" ON "procesos_onboarding"("fechaInicio");

-- CreateIndex
CREATE INDEX "reglas_onboarding_cooperativaId_idx" ON "reglas_onboarding"("cooperativaId");

-- CreateIndex
CREATE INDEX "reglas_onboarding_tipoRegla_idx" ON "reglas_onboarding"("tipoRegla");

-- CreateIndex
CREATE INDEX "reglas_onboarding_activa_idx" ON "reglas_onboarding"("activa");

-- CreateIndex
CREATE INDEX "documentos_onboarding_procesoOnboardingId_idx" ON "documentos_onboarding"("procesoOnboardingId");

-- CreateIndex
CREATE INDEX "documentos_onboarding_tipoDocumento_idx" ON "documentos_onboarding"("tipoDocumento");

-- CreateIndex
CREATE INDEX "documentos_onboarding_estado_idx" ON "documentos_onboarding"("estado");

-- CreateIndex
CREATE INDEX "pasos_onboarding_procesoOnboardingId_idx" ON "pasos_onboarding"("procesoOnboardingId");

-- CreateIndex
CREATE INDEX "pasos_onboarding_estado_idx" ON "pasos_onboarding"("estado");

-- CreateIndex
CREATE INDEX "validaciones_onboarding_procesoOnboardingId_idx" ON "validaciones_onboarding"("procesoOnboardingId");

-- CreateIndex
CREATE INDEX "validaciones_onboarding_tipoValidacion_idx" ON "validaciones_onboarding"("tipoValidacion");

-- CreateIndex
CREATE INDEX "validaciones_onboarding_estado_idx" ON "validaciones_onboarding"("estado");

-- CreateIndex
CREATE INDEX "comunicaciones_onboarding_procesoOnboardingId_idx" ON "comunicaciones_onboarding"("procesoOnboardingId");

-- CreateIndex
CREATE INDEX "comunicaciones_onboarding_tipoComunicacion_idx" ON "comunicaciones_onboarding"("tipoComunicacion");

-- CreateIndex
CREATE INDEX "comunicaciones_onboarding_estado_idx" ON "comunicaciones_onboarding"("estado");

-- CreateIndex
CREATE INDEX "resultados_reglas_onboarding_procesoOnboardingId_idx" ON "resultados_reglas_onboarding"("procesoOnboardingId");

-- CreateIndex
CREATE INDEX "resultados_reglas_onboarding_reglaOnboardingId_idx" ON "resultados_reglas_onboarding"("reglaOnboardingId");

-- CreateIndex
CREATE INDEX "resultados_reglas_onboarding_estado_idx" ON "resultados_reglas_onboarding"("estado");

-- CreateIndex
CREATE UNIQUE INDEX "proveedores_pago_codigo_key" ON "proveedores_pago"("codigo");

-- CreateIndex
CREATE INDEX "proveedores_pago_codigo_idx" ON "proveedores_pago"("codigo");

-- CreateIndex
CREATE INDEX "proveedores_pago_tipo_idx" ON "proveedores_pago"("tipo");

-- CreateIndex
CREATE INDEX "proveedores_pago_estado_idx" ON "proveedores_pago"("estado");

-- CreateIndex
CREATE UNIQUE INDEX "proveedores_pago_cooperativas_cooperativaId_key" ON "proveedores_pago_cooperativas"("cooperativaId");

-- CreateIndex
CREATE INDEX "proveedores_pago_cooperativas_cooperativaId_idx" ON "proveedores_pago_cooperativas"("cooperativaId");

-- CreateIndex
CREATE INDEX "proveedores_pago_cooperativas_proveedorPagoId_idx" ON "proveedores_pago_cooperativas"("proveedorPagoId");

-- CreateIndex
CREATE INDEX "proveedores_pago_cooperativas_activo_idx" ON "proveedores_pago_cooperativas"("activo");

-- CreateIndex
CREATE INDEX "proveedores_pago_cooperativas_esPrincipal_idx" ON "proveedores_pago_cooperativas"("esPrincipal");

-- CreateIndex
CREATE UNIQUE INDEX "configuraciones_suscripcion_cooperativaId_key" ON "configuraciones_suscripcion"("cooperativaId");

-- CreateIndex
CREATE INDEX "configuraciones_suscripcion_cooperativaId_idx" ON "configuraciones_suscripcion"("cooperativaId");

-- CreateIndex
CREATE INDEX "configuraciones_suscripcion_activa_idx" ON "configuraciones_suscripcion"("activa");

-- CreateIndex
CREATE INDEX "configuraciones_suscripcion_porcentajeComision_idx" ON "configuraciones_suscripcion"("porcentajeComision");

-- CreateIndex
CREATE INDEX "historial_configuraciones_suscripcion_configuracionId_idx" ON "historial_configuraciones_suscripcion"("configuracionId");

-- CreateIndex
CREATE INDEX "historial_configuraciones_suscripcion_fechaCambio_idx" ON "historial_configuraciones_suscripcion"("fechaCambio");

-- CreateIndex
CREATE INDEX "historial_configuraciones_suscripcion_campoModificado_idx" ON "historial_configuraciones_suscripcion"("campoModificado");

-- CreateIndex
CREATE INDEX "solicitudes_cambio_comision_configuracionId_idx" ON "solicitudes_cambio_comision"("configuracionId");

-- CreateIndex
CREATE INDEX "solicitudes_cambio_comision_estado_idx" ON "solicitudes_cambio_comision"("estado");

-- CreateIndex
CREATE INDEX "solicitudes_cambio_comision_fechaSolicitud_idx" ON "solicitudes_cambio_comision"("fechaSolicitud");

-- CreateIndex
CREATE INDEX "solicitudes_cambio_comision_porcentajeComisionSolicitado_idx" ON "solicitudes_cambio_comision"("porcentajeComisionSolicitado");

-- CreateIndex
CREATE INDEX "suscripciones_facturas_configuracionId_idx" ON "suscripciones_facturas"("configuracionId");

-- CreateIndex
CREATE INDEX "suscripciones_facturas_estado_idx" ON "suscripciones_facturas"("estado");

-- CreateIndex
CREATE INDEX "suscripciones_facturas_fechaGeneracion_idx" ON "suscripciones_facturas"("fechaGeneracion");

-- CreateIndex
CREATE INDEX "suscripciones_facturas_fechaVencimiento_idx" ON "suscripciones_facturas"("fechaVencimiento");

-- CreateIndex
CREATE INDEX "suscripciones_facturas_mes_anio_idx" ON "suscripciones_facturas"("mes", "anio");

-- CreateIndex
CREATE UNIQUE INDEX "suscripciones_facturas_configuracionId_mes_anio_key" ON "suscripciones_facturas"("configuracionId", "mes", "anio");

-- CreateIndex
CREATE INDEX "configuraciones_datos_bancarios_activo_idx" ON "configuraciones_datos_bancarios"("activo");

-- CreateIndex
CREATE INDEX "configuraciones_datos_bancarios_esPrincipal_idx" ON "configuraciones_datos_bancarios"("esPrincipal");

-- AddForeignKey
ALTER TABLE "usuarios_cooperativas" ADD CONSTRAINT "usuarios_cooperativas_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios_cooperativas" ADD CONSTRAINT "usuarios_cooperativas_cooperativaId_fkey" FOREIGN KEY ("cooperativaId") REFERENCES "cooperativas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios_cooperativas" ADD CONSTRAINT "usuarios_cooperativas_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "personas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_replacedByTokenId_fkey" FOREIGN KEY ("replacedByTokenId") REFERENCES "refresh_tokens"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roles" ADD CONSTRAINT "roles_cooperativaId_fkey" FOREIGN KEY ("cooperativaId") REFERENCES "cooperativas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios_roles" ADD CONSTRAINT "usuarios_roles_usuarioCooperativaId_fkey" FOREIGN KEY ("usuarioCooperativaId") REFERENCES "usuarios_cooperativas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios_roles" ADD CONSTRAINT "usuarios_roles_rolId_fkey" FOREIGN KEY ("rolId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "secciones_sistema" ADD CONSTRAINT "secciones_sistema_cooperativaId_fkey" FOREIGN KEY ("cooperativaId") REFERENCES "cooperativas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roles_permisos" ADD CONSTRAINT "roles_permisos_rolId_fkey" FOREIGN KEY ("rolId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roles_permisos" ADD CONSTRAINT "roles_permisos_seccionId_fkey" FOREIGN KEY ("seccionId") REFERENCES "secciones_sistema"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "personas" ADD CONSTRAINT "personas_cooperativaId_fkey" FOREIGN KEY ("cooperativaId") REFERENCES "cooperativas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos_kyc" ADD CONSTRAINT "documentos_kyc_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "personas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos_kyc" ADD CONSTRAINT "documentos_kyc_validadoPorId_fkey" FOREIGN KEY ("validadoPorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_estado_kyc" ADD CONSTRAINT "historial_estado_kyc_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "personas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_estado_kyc" ADD CONSTRAINT "historial_estado_kyc_cambiadoPorId_fkey" FOREIGN KEY ("cambiadoPorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudes_reset_password" ADD CONSTRAINT "solicitudes_reset_password_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "personas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificaciones_personas" ADD CONSTRAINT "notificaciones_personas_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "personas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inmuebles" ADD CONSTRAINT "inmuebles_titularInmuebleId_fkey" FOREIGN KEY ("titularInmuebleId") REFERENCES "personas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "servicios_disponibles" ADD CONSTRAINT "servicios_disponibles_cooperativaId_fkey" FOREIGN KEY ("cooperativaId") REFERENCES "cooperativas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categorias_consumo" ADD CONSTRAINT "categorias_consumo_cooperativaId_fkey" FOREIGN KEY ("cooperativaId") REFERENCES "cooperativas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categorias_consumo" ADD CONSTRAINT "categorias_consumo_servicioId_fkey" FOREIGN KEY ("servicioId") REFERENCES "servicios_disponibles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_precios_categorias" ADD CONSTRAINT "historial_precios_categorias_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categorias_consumo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cuentas" ADD CONSTRAINT "cuentas_cooperativaId_fkey" FOREIGN KEY ("cooperativaId") REFERENCES "cooperativas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cuentas" ADD CONSTRAINT "cuentas_titularServicioId_fkey" FOREIGN KEY ("titularServicioId") REFERENCES "personas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cuentas" ADD CONSTRAINT "cuentas_inmuebleId_fkey" FOREIGN KEY ("inmuebleId") REFERENCES "inmuebles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cuentas_servicios" ADD CONSTRAINT "cuentas_servicios_cuentaId_fkey" FOREIGN KEY ("cuentaId") REFERENCES "cuentas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cuentas_servicios" ADD CONSTRAINT "cuentas_servicios_servicioId_fkey" FOREIGN KEY ("servicioId") REFERENCES "servicios_disponibles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cuentas_servicios" ADD CONSTRAINT "cuentas_servicios_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categorias_consumo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cuentas_servicios" ADD CONSTRAINT "cuentas_servicios_medidorId_fkey" FOREIGN KEY ("medidorId") REFERENCES "medidores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medidores" ADD CONSTRAINT "medidores_cooperativaId_fkey" FOREIGN KEY ("cooperativaId") REFERENCES "cooperativas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medidores" ADD CONSTRAINT "medidores_inmuebleId_fkey" FOREIGN KEY ("inmuebleId") REFERENCES "inmuebles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lecturas" ADD CONSTRAINT "lecturas_tomadoPorId_fkey" FOREIGN KEY ("tomadoPorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lecturas" ADD CONSTRAINT "lecturas_medidorId_fkey" FOREIGN KEY ("medidorId") REFERENCES "medidores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lecturas" ADD CONSTRAINT "lecturas_facturaId_fkey" FOREIGN KEY ("facturaId") REFERENCES "facturas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_vinculaciones_medidor" ADD CONSTRAINT "historial_vinculaciones_medidor_medidorId_fkey" FOREIGN KEY ("medidorId") REFERENCES "medidores"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_vinculaciones_medidor" ADD CONSTRAINT "historial_vinculaciones_medidor_operadoPorId_fkey" FOREIGN KEY ("operadoPorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conceptos_facturables" ADD CONSTRAINT "conceptos_facturables_cooperativaId_fkey" FOREIGN KEY ("cooperativaId") REFERENCES "cooperativas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_conceptos" ADD CONSTRAINT "historial_conceptos_conceptoId_fkey" FOREIGN KEY ("conceptoId") REFERENCES "conceptos_facturables"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facturas" ADD CONSTRAINT "facturas_cuentaId_fkey" FOREIGN KEY ("cuentaId") REFERENCES "cuentas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "facturas" ADD CONSTRAINT "facturas_cuentaServicioId_fkey" FOREIGN KEY ("cuentaServicioId") REFERENCES "cuentas_servicios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items_factura" ADD CONSTRAINT "items_factura_facturaId_fkey" FOREIGN KEY ("facturaId") REFERENCES "facturas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items_factura" ADD CONSTRAINT "items_factura_conceptoId_fkey" FOREIGN KEY ("conceptoId") REFERENCES "conceptos_facturables"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudes_pago" ADD CONSTRAINT "solicitudes_pago_facturaId_fkey" FOREIGN KEY ("facturaId") REFERENCES "facturas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "intenciones_pago" ADD CONSTRAINT "intenciones_pago_solicitudPagoId_fkey" FOREIGN KEY ("solicitudPagoId") REFERENCES "solicitudes_pago"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "intenciones_pago" ADD CONSTRAINT "intenciones_pago_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_proveedorPagoId_fkey" FOREIGN KEY ("proveedorPagoId") REFERENCES "proveedores_pago"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_facturaId_fkey" FOREIGN KEY ("facturaId") REFERENCES "facturas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_solicitudPagoId_fkey" FOREIGN KEY ("solicitudPagoId") REFERENCES "solicitudes_pago"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_registradoPorId_fkey" FOREIGN KEY ("registradoPorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zonas" ADD CONSTRAINT "zonas_cooperativaId_fkey" FOREIGN KEY ("cooperativaId") REFERENCES "cooperativas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operaciones" ADD CONSTRAINT "operaciones_cooperativaId_fkey" FOREIGN KEY ("cooperativaId") REFERENCES "cooperativas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operaciones" ADD CONSTRAINT "operaciones_zonaId_fkey" FOREIGN KEY ("zonaId") REFERENCES "zonas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operaciones" ADD CONSTRAINT "operaciones_cuentaId_fkey" FOREIGN KEY ("cuentaId") REFERENCES "cuentas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operaciones" ADD CONSTRAINT "operaciones_cuentaServicioId_fkey" FOREIGN KEY ("cuentaServicioId") REFERENCES "cuentas_servicios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operaciones" ADD CONSTRAINT "operaciones_medidorId_fkey" FOREIGN KEY ("medidorId") REFERENCES "medidores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operaciones" ADD CONSTRAINT "operaciones_asignadoAId_fkey" FOREIGN KEY ("asignadoAId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operaciones" ADD CONSTRAINT "operaciones_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adjuntos_operaciones" ADD CONSTRAINT "adjuntos_operaciones_operacionId_fkey" FOREIGN KEY ("operacionId") REFERENCES "operaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adjuntos_operaciones" ADD CONSTRAINT "adjuntos_operaciones_subidoPorId_fkey" FOREIGN KEY ("subidoPorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_operaciones" ADD CONSTRAINT "historial_operaciones_operacionId_fkey" FOREIGN KEY ("operacionId") REFERENCES "operaciones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_operaciones" ADD CONSTRAINT "historial_operaciones_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categorias_reportes" ADD CONSTRAINT "categorias_reportes_cooperativaId_fkey" FOREIGN KEY ("cooperativaId") REFERENCES "cooperativas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plantillas_reportes" ADD CONSTRAINT "plantillas_reportes_cooperativaId_fkey" FOREIGN KEY ("cooperativaId") REFERENCES "cooperativas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plantillas_reportes" ADD CONSTRAINT "plantillas_reportes_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categorias_reportes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plantillas_reportes" ADD CONSTRAINT "plantillas_reportes_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reportes" ADD CONSTRAINT "reportes_cooperativaId_fkey" FOREIGN KEY ("cooperativaId") REFERENCES "cooperativas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reportes" ADD CONSTRAINT "reportes_plantillaId_fkey" FOREIGN KEY ("plantillaId") REFERENCES "plantillas_reportes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reportes" ADD CONSTRAINT "reportes_solicitadoPorId_fkey" FOREIGN KEY ("solicitadoPorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reportes" ADD CONSTRAINT "reportes_aprobadoPorId_fkey" FOREIGN KEY ("aprobadoPorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "descargas_reportes" ADD CONSTRAINT "descargas_reportes_reporteId_fkey" FOREIGN KEY ("reporteId") REFERENCES "reportes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "descargas_reportes" ADD CONSTRAINT "descargas_reportes_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reportes_compartidos" ADD CONSTRAINT "reportes_compartidos_reporteId_fkey" FOREIGN KEY ("reporteId") REFERENCES "reportes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reportes_compartidos" ADD CONSTRAINT "reportes_compartidos_compartidoPorId_fkey" FOREIGN KEY ("compartidoPorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reportes_compartidos" ADD CONSTRAINT "reportes_compartidos_compartidoConId_fkey" FOREIGN KEY ("compartidoConId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logs_consultas_directas" ADD CONSTRAINT "logs_consultas_directas_cooperativaId_fkey" FOREIGN KEY ("cooperativaId") REFERENCES "cooperativas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logs_consultas_directas" ADD CONSTRAINT "logs_consultas_directas_ejecutadoPorId_fkey" FOREIGN KEY ("ejecutadoPorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "configuraciones_retencion_datos" ADD CONSTRAINT "configuraciones_retencion_datos_cooperativaId_fkey" FOREIGN KEY ("cooperativaId") REFERENCES "cooperativas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "legajos" ADD CONSTRAINT "legajos_cooperativaId_fkey" FOREIGN KEY ("cooperativaId") REFERENCES "cooperativas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "legajos" ADD CONSTRAINT "legajos_inmuebleId_fkey" FOREIGN KEY ("inmuebleId") REFERENCES "inmuebles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "legajos" ADD CONSTRAINT "legajos_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transferencias_titularidad" ADD CONSTRAINT "transferencias_titularidad_titularAnteriorId_fkey" FOREIGN KEY ("titularAnteriorId") REFERENCES "personas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transferencias_titularidad" ADD CONSTRAINT "transferencias_titularidad_titularNuevoId_fkey" FOREIGN KEY ("titularNuevoId") REFERENCES "personas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transferencias_titularidad" ADD CONSTRAINT "transferencias_titularidad_legajoId_fkey" FOREIGN KEY ("legajoId") REFERENCES "legajos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transferencias_titularidad" ADD CONSTRAINT "transferencias_titularidad_registradoPorId_fkey" FOREIGN KEY ("registradoPorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transferencias_titularidad" ADD CONSTRAINT "transferencias_titularidad_verificadoPorId_fkey" FOREIGN KEY ("verificadoPorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos_legajo" ADD CONSTRAINT "documentos_legajo_legajoId_fkey" FOREIGN KEY ("legajoId") REFERENCES "legajos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos_legajo" ADD CONSTRAINT "documentos_legajo_subidoPorId_fkey" FOREIGN KEY ("subidoPorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos_legajo" ADD CONSTRAINT "documentos_legajo_validadoPorId_fkey" FOREIGN KEY ("validadoPorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos_transferencia" ADD CONSTRAINT "documentos_transferencia_transferenciaId_fkey" FOREIGN KEY ("transferenciaId") REFERENCES "transferencias_titularidad"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos_transferencia" ADD CONSTRAINT "documentos_transferencia_subidoPorId_fkey" FOREIGN KEY ("subidoPorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anotaciones_legajo" ADD CONSTRAINT "anotaciones_legajo_legajoId_fkey" FOREIGN KEY ("legajoId") REFERENCES "legajos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anotaciones_legajo" ADD CONSTRAINT "anotaciones_legajo_anotadoPorId_fkey" FOREIGN KEY ("anotadoPorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "configuraciones_legajos" ADD CONSTRAINT "configuraciones_legajos_cooperativaId_fkey" FOREIGN KEY ("cooperativaId") REFERENCES "cooperativas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "configuraciones_onboarding" ADD CONSTRAINT "configuraciones_onboarding_cooperativaId_fkey" FOREIGN KEY ("cooperativaId") REFERENCES "cooperativas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procesos_onboarding" ADD CONSTRAINT "procesos_onboarding_cooperativaId_fkey" FOREIGN KEY ("cooperativaId") REFERENCES "cooperativas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procesos_onboarding" ADD CONSTRAINT "procesos_onboarding_usuarioCreadoId_fkey" FOREIGN KEY ("usuarioCreadoId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reglas_onboarding" ADD CONSTRAINT "reglas_onboarding_cooperativaId_fkey" FOREIGN KEY ("cooperativaId") REFERENCES "cooperativas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documentos_onboarding" ADD CONSTRAINT "documentos_onboarding_procesoOnboardingId_fkey" FOREIGN KEY ("procesoOnboardingId") REFERENCES "procesos_onboarding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pasos_onboarding" ADD CONSTRAINT "pasos_onboarding_procesoOnboardingId_fkey" FOREIGN KEY ("procesoOnboardingId") REFERENCES "procesos_onboarding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "validaciones_onboarding" ADD CONSTRAINT "validaciones_onboarding_procesoOnboardingId_fkey" FOREIGN KEY ("procesoOnboardingId") REFERENCES "procesos_onboarding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comunicaciones_onboarding" ADD CONSTRAINT "comunicaciones_onboarding_procesoOnboardingId_fkey" FOREIGN KEY ("procesoOnboardingId") REFERENCES "procesos_onboarding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resultados_reglas_onboarding" ADD CONSTRAINT "resultados_reglas_onboarding_procesoOnboardingId_fkey" FOREIGN KEY ("procesoOnboardingId") REFERENCES "procesos_onboarding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resultados_reglas_onboarding" ADD CONSTRAINT "resultados_reglas_onboarding_reglaOnboardingId_fkey" FOREIGN KEY ("reglaOnboardingId") REFERENCES "reglas_onboarding"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proveedores_pago_cooperativas" ADD CONSTRAINT "proveedores_pago_cooperativas_cooperativaId_fkey" FOREIGN KEY ("cooperativaId") REFERENCES "cooperativas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proveedores_pago_cooperativas" ADD CONSTRAINT "proveedores_pago_cooperativas_proveedorPagoId_fkey" FOREIGN KEY ("proveedorPagoId") REFERENCES "proveedores_pago"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "configuraciones_suscripcion" ADD CONSTRAINT "configuraciones_suscripcion_cooperativaId_fkey" FOREIGN KEY ("cooperativaId") REFERENCES "cooperativas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_configuraciones_suscripcion" ADD CONSTRAINT "historial_configuraciones_suscripcion_configuracionId_fkey" FOREIGN KEY ("configuracionId") REFERENCES "configuraciones_suscripcion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitudes_cambio_comision" ADD CONSTRAINT "solicitudes_cambio_comision_configuracionId_fkey" FOREIGN KEY ("configuracionId") REFERENCES "configuraciones_suscripcion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suscripciones_facturas" ADD CONSTRAINT "suscripciones_facturas_configuracionId_fkey" FOREIGN KEY ("configuracionId") REFERENCES "configuraciones_suscripcion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
