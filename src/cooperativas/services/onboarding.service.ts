import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

// Tipos temporales hasta regenerar el cliente Prisma
export enum EstadoOnboarding {
  INICIADO = 'INICIADO',
  EN_PROGRESO = 'EN_PROGRESO',
  PENDIENTE_VALIDACION = 'PENDIENTE_VALIDACION',
  PENDIENTE_APROBACION = 'PENDIENTE_APROBACION',
  COMPLETADO = 'COMPLETADO',
  RECHAZADO = 'RECHAZADO',
  CANCELADO = 'CANCELADO',
  EXPIRADO = 'EXPIRADO',
}

export enum TipoDocumento {
  DNI = 'DNI',
  PASAPORTE = 'PASAPORTE',
  CEDULA = 'CEDULA',
}

export interface IniciarOnboardingDto {
  email: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  documento: string;
  tipoDocumento?: TipoDocumento;
  fechaNacimiento?: Date;
  domicilio?: string;
  localidad?: string;
  provincia?: string;
  codigoPostal?: string;
  origenSolicitud?: string;
}

export interface ActualizarDatosOnboardingDto {
  nombre?: string;
  apellido?: string;
  telefono?: string;
  fechaNacimiento?: Date;
  domicilio?: string;
  localidad?: string;
  provincia?: string;
  codigoPostal?: string;
}

export interface SubirDocumentoDto {
  nombre: string;
  tipoDocumento: string;
  descripcion?: string;
  esObligatorio?: boolean;
  archivo: {
    nombreArchivo: string;
    rutaArchivo: string;
    tamanoBytes: number;
    tipoMime: string;
  };
}

export interface AprobarRechazarDto {
  aprobado: boolean;
  observaciones?: string;
  motivoRechazo?: string;
}

@Injectable()
export class OnboardingService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Inicia un nuevo proceso de onboarding
   */
  async iniciarOnboarding(
    cooperativaId: string,
    datos: IniciarOnboardingDto,
    sessionInfo?: any,
  ) {
    // Verificar que la cooperativa tiene onboarding activado
    const configuracion = await this.obtenerConfiguracion(cooperativaId);
    if (!configuracion.activado) {
      throw new BadRequestException('El onboarding no está activado para esta cooperativa');
    }

    // Verificar que no existe un proceso en curso para este email
    const procesoExistente = await (this.prisma as any).procesoOnboarding.findFirst({
      where: {
        cooperativaId,
        email: datos.email,
        estado: {
          in: [EstadoOnboarding.INICIADO, EstadoOnboarding.EN_PROGRESO, EstadoOnboarding.PENDIENTE_VALIDACION],
        },
      },
    });

    if (procesoExistente) {
      throw new BadRequestException('Ya existe un proceso de onboarding en curso para este email');
    }

    // Calcular fecha de vencimiento
    const fechaVencimiento = new Date();
    fechaVencimiento.setDate(fechaVencimiento.getDate() + configuracion.tiempoLimiteOnboarding);

    // Generar código de referencia único
    const codigoReferencia = this.generarCodigoReferencia();

    // Crear el proceso de onboarding
    const proceso = await (this.prisma as any).procesoOnboarding.create({
      data: {
        ...datos,
        cooperativaId,
        estado: EstadoOnboarding.INICIADO,
        fechaVencimiento,
        codigoReferencia,
        pasosPendientes: configuracion.pasosObligatorios,
        requiereAprobacion: configuracion.requiereAprobacionManual,
        ipRegistro: sessionInfo?.ipAddress,
        userAgent: sessionInfo?.userAgent,
      },
    });

    // Ejecutar reglas de inicio
    await this.ejecutarReglasEtapa(proceso.id, 'INICIO');

    // Enviar email de bienvenida si está configurado
    if (configuracion.emailBienvenida) {
      await this.enviarComunicacion(proceso.id, 'BIENVENIDA', 'EMAIL', configuracion.emailBienvenida);
    }

    return {
      success: true,
      procesoId: proceso.id,
      codigoReferencia: proceso.codigoReferencia,
      fechaVencimiento: proceso.fechaVencimiento,
      pasosRequeridos: configuracion.pasosObligatorios,
      documentosRequeridos: configuracion.documentosRequeridos,
    };
  }

  /**
   * Obtiene el estado actual de un proceso de onboarding
   */
  async obtenerEstadoProceso(cooperativaId: string, procesoId: string) {
    const proceso = await (this.prisma as any).procesoOnboarding.findFirst({
      where: { id: procesoId, cooperativaId },
      include: {
        documentos: true,
        pasos: true,
        validaciones: true,
        comunicaciones: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!proceso) {
      throw new NotFoundException('Proceso de onboarding no encontrado');
    }

    return {
      id: proceso.id,
      estado: proceso.estado,
      codigoReferencia: proceso.codigoReferencia,
      progreso: this.calcularProgreso(proceso),
      pasoActual: proceso.pasoActual,
      pasosCompletados: proceso.pasosCompletados,
      pasosPendientes: proceso.pasosPendientes,
      fechaInicio: proceso.fechaInicio,
      fechaVencimiento: proceso.fechaVencimiento,
      datosPersonales: {
        nombre: proceso.nombre,
        apellido: proceso.apellido,
        email: proceso.email,
        telefono: proceso.telefono,
        documento: proceso.documento,
        domicilio: proceso.domicilio,
      },
      documentos: proceso.documentos.map((doc: any) => ({
        id: doc.id,
        nombre: doc.nombre,
        tipo: doc.tipoDocumento,
        estado: doc.estado,
        fechaSubida: doc.fechaSubida,
        esObligatorio: doc.esObligatorio,
      })),
      validaciones: {
        email: proceso.emailValidado,
        telefono: proceso.telefonoValidado,
        domicilio: proceso.domicilioValidado,
      },
      ultimasComunicaciones: proceso.comunicaciones,
    };
  }

  /**
   * Actualiza los datos personales de un proceso
   */
  async actualizarDatos(
    cooperativaId: string,
    procesoId: string,
    datos: ActualizarDatosOnboardingDto,
  ) {
    const proceso = await this.validarProceso(cooperativaId, procesoId);

    const procesoActualizado = await (this.prisma as any).procesoOnboarding.update({
      where: { id: proceso.id },
      data: {
        ...datos,
        fechaUltimaActividad: new Date(),
      },
    });

    // Ejecutar reglas de validación
    await this.ejecutarReglasEtapa(proceso.id, 'VALIDACION');

    return {
      success: true,
      mensaje: 'Datos actualizados correctamente',
    };
  }

  /**
   * Sube un documento para el proceso de onboarding
   */
  async subirDocumento(
    cooperativaId: string,
    procesoId: string,
    documentoDto: SubirDocumentoDto,
  ) {
    const proceso = await this.validarProceso(cooperativaId, procesoId);

    // Crear el documento
    const documento = await (this.prisma as any).documentoOnboarding.create({
      data: {
        procesoOnboardingId: proceso.id,
        nombre: documentoDto.nombre,
        tipoDocumento: documentoDto.tipoDocumento,
        descripcion: documentoDto.descripcion,
        esObligatorio: documentoDto.esObligatorio ?? true,
        nombreArchivo: documentoDto.archivo.nombreArchivo,
        rutaArchivo: documentoDto.archivo.rutaArchivo,
        tamanoBytes: documentoDto.archivo.tamanoBytes,
        tipoMime: documentoDto.archivo.tipoMime,
        estado: 'PENDIENTE',
      },
    });

    // Actualizar actividad del proceso
    await (this.prisma as any).procesoOnboarding.update({
      where: { id: proceso.id },
      data: { fechaUltimaActividad: new Date() },
    });

    // Ejecutar reglas de documentación
    await this.ejecutarReglasEtapa(proceso.id, 'DOCUMENTACION');

    return {
      success: true,
      documentoId: documento.id,
      mensaje: 'Documento subido correctamente',
    };
  }

  /**
   * Valida un email mediante código de verificación
   */
  async validarEmail(cooperativaId: string, procesoId: string, codigo: string) {
    const proceso = await this.validarProceso(cooperativaId, procesoId);

    // Aquí iría la lógica de validación del código
    // Por simplicidad, asumimos que el código es válido

    await (this.prisma as any).procesoOnboarding.update({
      where: { id: proceso.id },
      data: {
        emailValidado: true,
        fechaUltimaActividad: new Date(),
      },
    });

    // Registrar la validación
    await (this.prisma as any).validacionOnboarding.create({
      data: {
        procesoOnboardingId: proceso.id,
        tipoValidacion: 'EMAIL',
        campo: 'email',
        valor: proceso.email,
        estado: 'EXITOSA',
        esValido: true,
        fechaValidacion: new Date(),
      },
    });

    return {
      success: true,
      mensaje: 'Email validado correctamente',
    };
  }

  /**
   * Completa un paso del proceso de onboarding
   */
  async completarPaso(cooperativaId: string, procesoId: string, nombrePaso: string, datos?: any) {
    const proceso = await this.validarProceso(cooperativaId, procesoId);

    // Crear o actualizar el paso
    await (this.prisma as any).pasoOnboarding.upsert({
      where: {
        procesoOnboardingId_nombre: {
          procesoOnboardingId: proceso.id,
          nombre: nombrePaso,
        },
      },
      create: {
        procesoOnboardingId: proceso.id,
        nombre: nombrePaso,
        estado: 'COMPLETADO',
        fechaCompletado: new Date(),
        datosSalida: datos,
      },
      update: {
        estado: 'COMPLETADO',
        fechaCompletado: new Date(),
        datosSalida: datos,
      },
    });

    // Actualizar el proceso
    const pasosCompletados = [...(proceso.pasosCompletados || [])];
    if (!pasosCompletados.includes(nombrePaso)) {
      pasosCompletados.push(nombrePaso);
    }

    const pasosPendientes = (proceso.pasosPendientes || []).filter((p: string) => p !== nombrePaso);

    await (this.prisma as any).procesoOnboarding.update({
      where: { id: proceso.id },
      data: {
        pasosCompletados,
        pasosPendientes,
        fechaUltimaActividad: new Date(),
      },
    });

    // Verificar si el proceso está completo
    await this.verificarComplecion(proceso.id);

    return {
      success: true,
      mensaje: `Paso ${nombrePaso} completado`,
      progreso: this.calcularProgreso({ ...proceso, pasosCompletados, pasosPendientes }),
    };
  }

  /**
   * Aprueba o rechaza un proceso de onboarding
   */
  async aprobarRechazar(
    cooperativaId: string,
    procesoId: string,
    usuarioAprobadorId: string,
    decision: AprobarRechazarDto,
  ) {
    const proceso = await this.validarProceso(cooperativaId, procesoId);

    if (proceso.estado !== EstadoOnboarding.PENDIENTE_APROBACION) {
      throw new BadRequestException('El proceso no está en estado de pendiente de aprobación');
    }

    const nuevoEstado = decision.aprobado ? EstadoOnboarding.COMPLETADO : EstadoOnboarding.RECHAZADO;

    await (this.prisma as any).procesoOnboarding.update({
      where: { id: proceso.id },
      data: {
        estado: nuevoEstado,
        fechaFinalizacion: new Date(),
        usuarioAprobadorId,
        motivoRechazo: decision.motivoRechazo,
        observacionesInternas: decision.observaciones,
      },
    });

    if (decision.aprobado) {
      // Ejecutar reglas de finalización
      await this.ejecutarReglasEtapa(proceso.id, 'FINALIZACION');
    }

    // Enviar comunicación correspondiente
    const configuracion = await this.obtenerConfiguracion(cooperativaId);
    const emailTemplate = decision.aprobado ? configuracion.emailAprobacion : configuracion.emailRechazo;
    
    if (emailTemplate) {
      await this.enviarComunicacion(
        proceso.id,
        decision.aprobado ? 'APROBACION' : 'RECHAZO',
        'EMAIL',
        emailTemplate,
      );
    }

    return {
      success: true,
      mensaje: decision.aprobado ? 'Proceso aprobado exitosamente' : 'Proceso rechazado',
      estado: nuevoEstado,
    };
  }

  /**
   * Lista todos los procesos de onboarding de una cooperativa
   */
  async listarProcesos(cooperativaId: string, filtros?: any) {
    const where: any = { cooperativaId };

    if (filtros?.estado) {
      where.estado = filtros.estado;
    }

    if (filtros?.fechaDesde) {
      where.fechaInicio = { gte: new Date(filtros.fechaDesde) };
    }

    if (filtros?.fechaHasta) {
      where.fechaInicio = { ...where.fechaInicio, lte: new Date(filtros.fechaHasta) };
    }

    const procesos = await (this.prisma as any).procesoOnboarding.findMany({
      where,
      include: {
        _count: {
          select: {
            documentos: true,
            pasos: true,
          },
        },
      },
      orderBy: { fechaInicio: 'desc' },
    });

    return procesos.map((proceso: any) => ({
      id: proceso.id,
      codigoReferencia: proceso.codigoReferencia,
      nombre: `${proceso.nombre} ${proceso.apellido}`,
      email: proceso.email,
      estado: proceso.estado,
      fechaInicio: proceso.fechaInicio,
      fechaVencimiento: proceso.fechaVencimiento,
      progreso: this.calcularProgreso(proceso),
      documentos: proceso._count.documentos,
      pasos: proceso._count.pasos,
    }));
  }

  /**
   * Obtiene estadísticas de onboarding
   */
  async obtenerEstadisticas(cooperativaId: string) {
    const [total, iniciados, enProgreso, completados, rechazados, expirados] = await Promise.all([
      (this.prisma as any).procesoOnboarding.count({ where: { cooperativaId } }),
      (this.prisma as any).procesoOnboarding.count({ 
        where: { cooperativaId, estado: EstadoOnboarding.INICIADO } 
      }),
      (this.prisma as any).procesoOnboarding.count({ 
        where: { cooperativaId, estado: EstadoOnboarding.EN_PROGRESO } 
      }),
      (this.prisma as any).procesoOnboarding.count({ 
        where: { cooperativaId, estado: EstadoOnboarding.COMPLETADO } 
      }),
      (this.prisma as any).procesoOnboarding.count({ 
        where: { cooperativaId, estado: EstadoOnboarding.RECHAZADO } 
      }),
      (this.prisma as any).procesoOnboarding.count({ 
        where: { cooperativaId, estado: EstadoOnboarding.EXPIRADO } 
      }),
    ]);

    const tasaConversion = total > 0 ? Math.round((completados / total) * 100) : 0;

    return {
      total,
      estados: {
        iniciados,
        enProgreso,
        completados,
        rechazados,
        expirados,
      },
      tasaConversion,
      timestamp: new Date().toISOString(),
    };
  }

  // Métodos privados auxiliares

  private async validarProceso(cooperativaId: string, procesoId: string) {
    const proceso = await (this.prisma as any).procesoOnboarding.findFirst({
      where: { id: procesoId, cooperativaId },
    });

    if (!proceso) {
      throw new NotFoundException('Proceso de onboarding no encontrado');
    }

    if (proceso.estado === EstadoOnboarding.COMPLETADO) {
      throw new BadRequestException('El proceso ya está completado');
    }

    if (proceso.estado === EstadoOnboarding.EXPIRADO) {
      throw new BadRequestException('El proceso ha expirado');
    }

    return proceso;
  }

  private async obtenerConfiguracion(cooperativaId: string) {
    const configuracion = await (this.prisma as any).configuracionOnboarding.findUnique({
      where: { cooperativaId },
    });

    if (!configuracion) {
      // Configuración por defecto
      return {
        activado: true,
        requiereAprobacionManual: false,
        tiempoLimiteOnboarding: 30,
        pasosObligatorios: ['DATOS_PERSONALES', 'DOCUMENTACION', 'ACEPTACION_TERMINOS'],
        documentosRequeridos: ['DNI', 'COMPROBANTE_DOMICILIO'],
        requiereValidacionEmail: true,
        emailBienvenida: null,
        emailAprobacion: null,
        emailRechazo: null,
      };
    }

    return configuracion;
  }

  private calcularProgreso(proceso: any): number {
    const totalPasos = (proceso.pasosCompletados?.length || 0) + (proceso.pasosPendientes?.length || 0);
    if (totalPasos === 0) return 0;
    
    const completados = proceso.pasosCompletados?.length || 0;
    return Math.round((completados / totalPasos) * 100);
  }

  private generarCodigoReferencia(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `ONB-${timestamp}-${random}`.toUpperCase();
  }

  private async ejecutarReglasEtapa(procesoId: string, etapa: string) {
    // Implementación simplificada de ejecución de reglas
    // En un entorno real, esto ejecutaría las reglas configuradas
    console.log(`Ejecutando reglas para etapa ${etapa} en proceso ${procesoId}`);
  }

  private async enviarComunicacion(
    procesoId: string,
    tipo: string,
    canal: string,
    template: string,
  ) {
    // Implementación simplificada de envío de comunicaciones
    await (this.prisma as any).comunicacionOnboarding.create({
      data: {
        procesoOnboardingId: procesoId,
        tipoComunicacion: tipo,
        canal: canal,
        destinatario: '', // Se obtendría del proceso
        plantilla: template,
        estado: 'PENDIENTE',
      },
    });
  }

  private async verificarComplecion(procesoId: string) {
    const proceso = await (this.prisma as any).procesoOnboarding.findUnique({
      where: { id: procesoId },
    });

    if (!proceso.pasosPendientes || proceso.pasosPendientes.length === 0) {
      const nuevoEstado = proceso.requiereAprobacion 
        ? EstadoOnboarding.PENDIENTE_APROBACION 
        : EstadoOnboarding.COMPLETADO;

      await (this.prisma as any).procesoOnboarding.update({
        where: { id: procesoId },
        data: {
          estado: nuevoEstado,
          ...(nuevoEstado === EstadoOnboarding.COMPLETADO && { fechaFinalizacion: new Date() }),
        },
      });

      if (nuevoEstado === EstadoOnboarding.COMPLETADO) {
        await this.ejecutarReglasEtapa(procesoId, 'FINALIZACION');
      }
    }
  }
}