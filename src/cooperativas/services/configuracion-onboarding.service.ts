import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

// Tipos temporales hasta regenerar el cliente Prisma
export enum TipoReglaOnboarding {
  VALIDACION_DATOS = 'VALIDACION_DATOS',
  VERIFICACION_IDENTIDAD = 'VERIFICACION_IDENTIDAD',
  COMPROBACION_DOMICILIO = 'COMPROBACION_DOMICILIO',
  VALIDACION_CREDITICIA = 'VALIDACION_CREDITICIA',
  INTEGRACION_EXTERNA = 'INTEGRACION_EXTERNA',
  ASIGNACION_SERVICIOS = 'ASIGNACION_SERVICIOS',
  CREACION_CUENTA = 'CREACION_CUENTA',
  NOTIFICACION = 'NOTIFICACION',
  CUSTOM = 'CUSTOM',
}

export enum EtapaOnboarding {
  INICIO = 'INICIO',
  VALIDACION = 'VALIDACION',
  DOCUMENTACION = 'DOCUMENTACION',
  VERIFICACION = 'VERIFICACION',
  APROBACION = 'APROBACION',
  FINALIZACION = 'FINALIZACION',
}

export interface ConfiguracionOnboardingDto {
  activado?: boolean;
  requiereAprobacionManual?: boolean;
  tiempoLimiteOnboarding?: number;
  pasosObligatorios?: string[];
  pasosOpcionales?: string[];
  documentosRequeridos?: string[];
  documentosOpcionales?: string[];
  requiereValidacionEmail?: boolean;
  requiereValidacionTelefono?: boolean;
  requiereValidacionDomicilio?: boolean;
  emailBienvenida?: string;
  emailRecordatorio?: string;
  diasRecordatorio?: number;
  maxRecordatorios?: number;
  emailAprobacion?: string;
  emailRechazo?: string;
  integrarConSistemaContable?: boolean;
  integrarConCRM?: boolean;
  crearCuentaAutomatica?: boolean;
  asignarServiciosBasicos?: string[];
}

export interface CrearReglaOnboardingDto {
  nombre: string;
  descripcion?: string;
  tipoRegla: TipoReglaOnboarding;
  condiciones: Record<string, any>;
  acciones: Record<string, any>;
  parametros?: Record<string, any>;
  ejecutarEn?: EtapaOnboarding[];
  esCritica?: boolean;
  esAsincrona?: boolean;
  permiteReintentos?: boolean;
  maxReintentos?: number;
  tiempoEsperaMins?: number;
}

export interface ActualizarReglaOnboardingDto
  extends Partial<CrearReglaOnboardingDto> {
  activa?: boolean;
  orden?: number;
}

@Injectable()
export class ConfiguracionOnboardingService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Obtiene la configuración de onboarding de una cooperativa
   */
  async obtenerConfiguracion(cooperativaId: string) {
    const configuracion = await this.prisma.configuracionOnboarding.findUnique({
      where: { cooperativaId },
    });

    if (!configuracion) {
      // Crear configuración por defecto
      return this.crearConfiguracionPorDefecto(cooperativaId);
    }

    return configuracion;
  }

  /**
   * Actualiza la configuración de onboarding
   */
  async actualizarConfiguracion(
    cooperativaId: string,
    datos: ConfiguracionOnboardingDto,
  ) {
    const configuracionExistente = await this.prisma.configuracionOnboarding.findUnique({
      where: { cooperativaId },
    });

    if (!configuracionExistente) {
      // Crear nueva configuración
      return this.prisma.configuracionOnboarding.create({
        data: {
          ...datos,
          cooperativaId,
        },
      });
    }

    // Actualizar configuración existente
    return this.prisma.configuracionOnboarding.update({
      where: { cooperativaId },
      data: datos,
    });
  }

  /**
   * Obtiene todas las reglas de onboarding de una cooperativa
   */
  async obtenerReglas(cooperativaId: string) {
    return this.prisma.reglaOnboarding.findMany({
      where: { cooperativaId },
      orderBy: [{ orden: 'asc' }, { createdAt: 'asc' }],
    });
  }

  /**
   * Obtiene una regla específica
   */
  async obtenerRegla(id: string, cooperativaId: string) {
    const regla = await this.prisma.reglaOnboarding.findFirst({
      where: { id, cooperativaId },
    });

    if (!regla) {
      throw new NotFoundException(`Regla de onboarding con ID ${id} no encontrada`);
    }

    return regla;
  }

  /**
   * Crea una nueva regla de onboarding
   */
  async crearRegla(cooperativaId: string, datos: CrearReglaOnboardingDto) {
    // Obtener el siguiente orden
    const ultimaRegla = await this.prisma.reglaOnboarding.findFirst({
      where: { cooperativaId },
      orderBy: { orden: 'desc' },
    });

    const orden = ultimaRegla ? ultimaRegla.orden + 1 : 1;

    return this.prisma.reglaOnboarding.create({
      data: {
        ...datos,
        cooperativaId,
        orden,
      },
    });
  }

  /**
   * Actualiza una regla de onboarding
   */
  async actualizarRegla(
    id: string,
    cooperativaId: string,
    datos: ActualizarReglaOnboardingDto,
  ) {
    const regla = await this.obtenerRegla(id, cooperativaId);

    return this.prisma.reglaOnboarding.update({
      where: { id: regla.id },
      data: datos,
    });
  }

  /**
   * Elimina una regla de onboarding
   */
  async eliminarRegla(id: string, cooperativaId: string) {
    const regla = await this.obtenerRegla(id, cooperativaId);

    await this.prisma.reglaOnboarding.delete({
      where: { id: regla.id },
    });

    return { success: true };
  }

  /**
   * Reordena las reglas de onboarding
   */
  async reordenarReglas(cooperativaId: string, nuevosOrdenes: Array<{ id: string; orden: number }>) {
    const transacciones = nuevosOrdenes.map(({ id, orden }) =>
      this.prisma.reglaOnboarding.update({
        where: { id },
        data: { orden },
      }),
    );

    await this.prisma.$transaction(transacciones);

    return { success: true };
  }

  /**
   * Obtiene las reglas activas para una etapa específica
   */
  async obtenerReglasParaEtapa(cooperativaId: string, etapa: EtapaOnboarding) {
    return this.prisma.reglaOnboarding.findMany({
      where: {
        cooperativaId,
        activa: true,
        ejecutarEn: {
          has: etapa,
        },
      },
      orderBy: [{ orden: 'asc' }, { createdAt: 'asc' }],
    });
  }

  /**
   * Crea configuración por defecto para una cooperativa
   */
  private async crearConfiguracionPorDefecto(cooperativaId: string) {
    const configuracionDefecto: ConfiguracionOnboardingDto = {
      activado: true,
      requiereAprobacionManual: false,
      tiempoLimiteOnboarding: 30,
      pasosObligatorios: ['DATOS_PERSONALES', 'DOCUMENTACION', 'ACEPTACION_TERMINOS'],
      pasosOpcionales: ['CONFIGURACION_SERVICIOS', 'ENCUESTA_BIENVENIDA'],
      documentosRequeridos: ['DNI', 'COMPROBANTE_DOMICILIO'],
      documentosOpcionales: ['COMPROBANTE_INGRESOS'],
      requiereValidacionEmail: true,
      requiereValidacionTelefono: false,
      requiereValidacionDomicilio: true,
      diasRecordatorio: 7,
      maxRecordatorios: 3,
      integrarConSistemaContable: false,
      integrarConCRM: false,
      crearCuentaAutomatica: true,
      asignarServiciosBasicos: [],
    };

    const configuracion = await this.prisma.configuracionOnboarding.create({
      data: {
        ...configuracionDefecto,
        cooperativaId,
      },
    });

    // Crear reglas por defecto
    await this.crearReglasDefecto(cooperativaId);

    return configuracion;
  }

  /**
   * Crea reglas por defecto para una cooperativa
   */
  private async crearReglasDefecto(cooperativaId: string) {
    const reglasDefecto: CrearReglaOnboardingDto[] = [
      {
        nombre: 'Validación de Email',
        descripcion: 'Valida que el email proporcionado sea válido y esté disponible',
        tipoRegla: TipoReglaOnboarding.VALIDACION_DATOS,
        condiciones: {
          campos: ['email'],
          validaciones: ['formato', 'disponibilidad'],
        },
        acciones: {
          enviarCodigoVerificacion: true,
          marcarComoValidado: true,
        },
        ejecutarEn: [EtapaOnboarding.VALIDACION],
        esCritica: true,
      },
      {
        nombre: 'Verificación de Identidad',
        descripcion: 'Verifica la identidad del solicitante mediante documentos',
        tipoRegla: TipoReglaOnboarding.VERIFICACION_IDENTIDAD,
        condiciones: {
          documentosRequeridos: ['DNI'],
          verificacionManual: false,
        },
        acciones: {
          validarDocumento: true,
          compararDatos: true,
        },
        ejecutarEn: [EtapaOnboarding.VERIFICACION],
        esCritica: true,
      },
      {
        nombre: 'Creación de Cuenta Automática',
        descripcion: 'Crea automáticamente la cuenta del usuario al completar el onboarding',
        tipoRegla: TipoReglaOnboarding.CREACION_CUENTA,
        condiciones: {
          onboardingCompletado: true,
          aprobacionRecibida: true,
        },
        acciones: {
          crearUsuario: true,
          asignarRoles: ['SOCIO'],
          enviarCredenciales: true,
        },
        ejecutarEn: [EtapaOnboarding.FINALIZACION],
        esCritica: true,
      },
      {
        nombre: 'Notificación de Bienvenida',
        descripcion: 'Envía email de bienvenida al completar el proceso',
        tipoRegla: TipoReglaOnboarding.NOTIFICACION,
        condiciones: {
          procesoCompletado: true,
        },
        acciones: {
          enviarEmail: true,
          plantilla: 'bienvenida',
        },
        ejecutarEn: [EtapaOnboarding.FINALIZACION],
        esCritica: false,
      },
    ];

    for (const [index, regla] of reglasDefecto.entries()) {
      await this.prisma.reglaOnboarding.create({
        data: {
          ...regla,
          cooperativaId,
          orden: index + 1,
        },
      });
    }
  }

  /**
   * Obtiene estadísticas de configuración
   */
  async obtenerEstadisticas(cooperativaId: string) {
    const [configuracion, totalReglas, reglasActivas, reglasInactivas] = await Promise.all([
      this.obtenerConfiguracion(cooperativaId),
      this.prisma.reglaOnboarding.count({ where: { cooperativaId } }),
      this.prisma.reglaOnboarding.count({ where: { cooperativaId, activa: true } }),
      this.prisma.reglaOnboarding.count({ where: { cooperativaId, activa: false } }),
    ]);

    return {
      configuracion: {
        activado: configuracion.activado,
        requiereAprobacionManual: configuracion.requiereAprobacionManual,
        tiempoLimiteOnboarding: configuracion.tiempoLimiteOnboarding,
      },
      reglas: {
        total: totalReglas,
        activas: reglasActivas,
        inactivas: reglasInactivas,
      },
    };
  }
}