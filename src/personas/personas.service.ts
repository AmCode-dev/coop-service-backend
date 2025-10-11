import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';

import {
  CreatePersonaDto,
  UpdatePersonaDto,
  ActualizarEstadoKYCDto,
  SubirDocumentoKYCDto,
  ValidarDocumentoKYCDto,
  BuscarPersonasDto,
  SolicitudResetPasswordDto,
  ResetPasswordDto,
  VincularUsuarioDto,
  EnviarNotificacionDto,
} from './dto';
import type {
  PersonaBasica,
  PersonaDetalle,
  DocumentoKYCDetalle,
  EstadisticasKYC,
  ResumenSocio,
  HistorialKYC,
  FiltrosPersonas,
  ResultadoPaginado,
  NotificacionPersona,
} from './interfaces/personas.interface';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { PrismaService } from 'src/prisma';
import {
  Persona,
  Usuario,
  DocumentoKYC,
  HistorialEstadoKYC,
  NotificacionPersona as NotificacionPersonaPrisma,
  TipoDocumento,
  EstadoKYC,
  EstadoSocio,
  CategoriaIVA,
  UsuarioCooperativa,
  Cooperativa,
  Cuenta,
  Inmueble,
} from '../../generated/prisma';

// Tipos extendidos para queries complejas
type PersonaConRelaciones = Persona & {
  cooperativa?: Pick<Cooperativa, 'id' | 'nombre'>;
  usuariosCooperativa?: (UsuarioCooperativa & {
    usuario: Pick<Usuario, 'id' | 'email' | 'activo'>;
  })[];
  cuentasComoTitularServicio?: (Cuenta & {
    inmueble: Pick<Inmueble, 'domicilio' | 'localidad'>;
  })[];
  inmueblesComoTitular?: Inmueble[];
};

type DocumentoKYCConRelaciones = DocumentoKYC & {
  validadoPor?: Pick<Usuario, 'id' | 'nombre' | 'apellido'>;
};

type HistorialKYCConRelaciones = HistorialEstadoKYC & {
  cambiadoPor?: Pick<Usuario, 'id' | 'nombre' | 'apellido'>;
};

@Injectable()
export class PersonasService {
  constructor(private prisma: PrismaService) {}

  // ============================================
  // CRUD DE PERSONAS
  // ============================================

  async crear(
    createPersonaDto: CreatePersonaDto,
    cooperativaId: string,
    usuarioId: string,
  ): Promise<PersonaDetalle> {
    // Verificar que no exista una persona con el mismo documento en la cooperativa
    const personaExistente = await this.prisma.persona.findFirst({
      where: {
        cooperativaId,
        tipoDocumento: createPersonaDto.tipoDocumento as TipoDocumento,
        numeroDocumento: createPersonaDto.numeroDocumento,
      },
    });

    if (personaExistente) {
      throw new ConflictException(
        `Ya existe una persona con ${createPersonaDto.tipoDocumento} ${createPersonaDto.numeroDocumento} en esta cooperativa`,
      );
    }

    // Verificar número de socio único si se proporciona
    if (createPersonaDto.numeroSocio) {
      const numeroSocioExistente = await this.prisma.persona.findFirst({
        where: {
          cooperativaId,
          numeroSocio: createPersonaDto.numeroSocio,
        },
      });

      if (numeroSocioExistente) {
        throw new ConflictException(
          `El número de socio ${createPersonaDto.numeroSocio} ya está en uso`,
        );
      }
    }

    // Generar número de socio automáticamente si no se proporciona
    let numeroSocio = createPersonaDto.numeroSocio;
    if (!numeroSocio) {
      numeroSocio = await this.generarNumeroSocio(cooperativaId);
    }

    const persona = await this.prisma.persona.create({
      data: {
        ...createPersonaDto,
        numeroSocio,
        cooperativaId,
        fechaNacimiento: createPersonaDto.fechaNacimiento
          ? new Date(createPersonaDto.fechaNacimiento)
          : undefined,
        fechaAlta: createPersonaDto.fechaAlta
          ? new Date(createPersonaDto.fechaAlta)
          : new Date(),
        ingresosMensuales: createPersonaDto.ingresosMensuales
          ? parseFloat(createPersonaDto.ingresosMensuales)
          : undefined,
      },
      include: this.getIncludePersonaDetalle(),
    });

    // Crear historial KYC inicial
    await this.prisma.historialEstadoKYC.create({
      data: {
        personaId: persona.id,
        estadoNuevo: 'PENDIENTE',
        motivo: 'Registro inicial',
        cambiadoPorId: usuarioId,
      },
    });

    return this.mapPersonaDetalle(persona);
  }

  async buscarTodos(
    cooperativaId: string,
    filtros: BuscarPersonasDto = {},
  ): Promise<ResultadoPaginado<PersonaBasica>> {
    const {
      busqueda,
      estadoKYC,
      estadoSocio,
      tipoDocumento,
      localidad,
      provincia,
      fechaAltaDesde,
      fechaAltaHasta,
      requiereActualizacionKYC,
      soloConCuentas,
      soloSinUsuario,
      pagina = 1,
      limite = 20,
      ordenarPor = 'nombre',
      ordenDireccion = 'asc',
    } = filtros;

    const skip = (pagina - 1) * limite;
    const where = this.construirWhereBusqueda(cooperativaId, filtros);

    const [personas, total] = await Promise.all([
      this.prisma.persona.findMany({
        where,
        skip,
        take: limite,
        orderBy: this.construirOrderBy(ordenarPor, ordenDireccion),
        include: {
          cooperativa: { select: { id: true, nombre: true } },
          usuariosCooperativa: {
            select: {
              id: true,
              usuario: {
                select: {
                  id: true,
                  email: true,
                  activo: true,
                },
              },
              activo: true,
            },
          },
        },
      }),
      this.prisma.persona.count({ where }),
    ]);

    return {
      items: personas.map(this.mapPersonaBasica),
      total,
      pagina,
      limite,
      totalPaginas: Math.ceil(total / limite),
    };
  }

  async buscarPorId(
    id: string,
    cooperativaId: string,
  ): Promise<PersonaDetalle> {
    const persona = await this.prisma.persona.findFirst({
      where: { id, cooperativaId },
      include: this.getIncludePersonaDetalle(),
    });

    if (!persona) {
      throw new NotFoundException('Persona no encontrada');
    }

    return this.mapPersonaDetalle(persona);
  }

  async buscarPorDocumento(
    tipoDocumento: string,
    numeroDocumento: string,
    cooperativaId: string,
  ): Promise<PersonaDetalle> {
    const persona = await this.prisma.persona.findFirst({
      where: {
        tipoDocumento: tipoDocumento as any,
        numeroDocumento,
        cooperativaId,
      },
      include: this.getIncludePersonaDetalle(),
    });

    if (!persona) {
      throw new NotFoundException('Persona no encontrada');
    }

    return this.mapPersonaDetalle(persona);
  }

  async actualizar(
    id: string,
    updatePersonaDto: UpdatePersonaDto,
    cooperativaId: string,
    usuarioId: string,
  ): Promise<PersonaDetalle> {
    const personaExistente = await this.prisma.persona.findFirst({
      where: { id, cooperativaId },
    });

    if (!personaExistente) {
      throw new NotFoundException('Persona no encontrada');
    }

    // Verificar número de socio único si se está actualizando
    if (
      updatePersonaDto.numeroSocio &&
      updatePersonaDto.numeroSocio !== personaExistente.numeroSocio
    ) {
      const numeroSocioExistente = await this.prisma.persona.findFirst({
        where: {
          cooperativaId,
          numeroSocio: updatePersonaDto.numeroSocio,
          id: { not: id },
        },
      });

      if (numeroSocioExistente) {
        throw new ConflictException(
          `El número de socio ${updatePersonaDto.numeroSocio} ya está en uso`,
        );
      }
    }

    const persona = await this.prisma.persona.update({
      where: { id },
      data: {
        ...updatePersonaDto,
        fechaNacimiento: updatePersonaDto.fechaNacimiento
          ? new Date(updatePersonaDto.fechaNacimiento)
          : undefined,
        fechaAlta: updatePersonaDto.fechaAlta
          ? new Date(updatePersonaDto.fechaAlta)
          : undefined,
        ingresosMensuales: updatePersonaDto.ingresosMensuales
          ? parseFloat(updatePersonaDto.ingresosMensuales)
          : undefined,
      },
      include: this.getIncludePersonaDetalle(),
    });

    return this.mapPersonaDetalle(persona);
  }

  async eliminar(
    id: string,
    cooperativaId: string,
    usuarioId: string,
  ): Promise<void> {
    const persona = await this.prisma.persona.findFirst({
      where: { id, cooperativaId },
      include: {
        cuentasComoTitularServicio: true,
        inmueblesComoTitular: true,
        usuariosCooperativa: true,
      },
    });

    if (!persona) {
      throw new NotFoundException('Persona no encontrada');
    }

    // Verificar que no tenga dependencias activas
    if (persona.cuentasComoTitularServicio.length > 0) {
      throw new ConflictException(
        'No se puede eliminar la persona porque tiene cuentas de servicio asociadas',
      );
    }

    if (persona.inmueblesComoTitular.length > 0) {
      throw new ConflictException(
        'No se puede eliminar la persona porque tiene inmuebles asociados',
      );
    }

    if (persona.usuariosCooperativa.length > 0) {
      throw new ConflictException(
        'No se puede eliminar la persona porque tiene usuarios vinculados',
      );
    }

    await this.prisma.persona.delete({
      where: { id },
    });
  }

  // ============================================
  // GESTIÓN KYC
  // ============================================

  async actualizarEstadoKYC(
    personaId: string,
    actualizarEstadoDto: ActualizarEstadoKYCDto,
    cooperativaId: string,
    usuarioId: string,
  ): Promise<PersonaDetalle> {
    const persona = await this.prisma.persona.findFirst({
      where: { id: personaId, cooperativaId },
    });

    if (!persona) {
      throw new NotFoundException('Persona no encontrada');
    }

    const estadoAnterior = persona.estadoKYC;

    // Actualizar persona con nuevo estado KYC
    const updateData: any = {
      estadoKYC: actualizarEstadoDto.nuevoEstado,
      observacionesKYC: actualizarEstadoDto.observaciones,
    };

    if (actualizarEstadoDto.nuevoEstado === 'APROBADO') {
      updateData.fechaCompletadoKYC = new Date();
      updateData.requiereActualizacionKYC = false;
    }

    if (actualizarEstadoDto.proximaRevision) {
      updateData.proximaRevisionKYC = new Date(
        actualizarEstadoDto.proximaRevision,
      );
    }

    const personaActualizada = await this.prisma.$transaction(async (tx) => {
      // Actualizar persona
      const personaUpdated = await tx.persona.update({
        where: { id: personaId },
        data: updateData,
        include: this.getIncludePersonaDetalle(),
      });

      // Crear historial de cambio
      await tx.historialEstadoKYC.create({
        data: {
          personaId,
          estadoAnterior,
          estadoNuevo: actualizarEstadoDto.nuevoEstado,
          motivo: actualizarEstadoDto.motivo,
          observaciones: actualizarEstadoDto.observaciones,
          cambiadoPorId: usuarioId,
        },
      });

      return personaUpdated;
    });

    return this.mapPersonaDetalle(personaActualizada);
  }

  async subirDocumentoKYC(
    personaId: string,
    subirDocumentoDto: SubirDocumentoKYCDto,
    archivo: Express.Multer.File,
    cooperativaId: string,
  ): Promise<DocumentoKYCDetalle> {
    const persona = await this.prisma.persona.findFirst({
      where: { id: personaId, cooperativaId },
    });

    if (!persona) {
      throw new NotFoundException('Persona no encontrada');
    }

    // TODO: Implementar subida real del archivo (AWS S3, local storage, etc.)
    const urlArchivo = `/uploads/kyc/${personaId}/${archivo.filename}`;

    const documento = await this.prisma.documentoKYC.create({
      data: {
        personaId,
        tipoDocumento: subirDocumentoDto.tipoDocumento,
        nombreArchivo: subirDocumentoDto.nombreArchivo,
        urlArchivo,
        tamanioArchivo: archivo.size,
        mimeType: archivo.mimetype,
        fechaVencimiento: subirDocumentoDto.fechaVencimiento
          ? new Date(subirDocumentoDto.fechaVencimiento)
          : undefined,
      },
      include: {
        validadoPor: {
          select: { id: true, nombre: true, apellido: true },
        },
      },
    });

    // Si es el primer documento, cambiar estado KYC a EN_REVISION
    if (persona.estadoKYC === 'PENDIENTE') {
      await this.prisma.persona.update({
        where: { id: personaId },
        data: { estadoKYC: 'EN_REVISION', fechaInicioKYC: new Date() },
      });
    }

    return this.mapDocumentoKYC(documento);
  }

  async validarDocumentoKYC(
    documentoId: string,
    validarDto: ValidarDocumentoKYCDto,
    cooperativaId: string,
    usuarioId: string,
  ): Promise<DocumentoKYCDetalle> {
    const documento = await this.prisma.documentoKYC.findFirst({
      where: {
        id: documentoId,
        persona: { cooperativaId },
      },
      include: { persona: true },
    });

    if (!documento) {
      throw new NotFoundException('Documento no encontrado');
    }

    const documentoActualizado = await this.prisma.documentoKYC.update({
      where: { id: documentoId },
      data: {
        validado: validarDto.validado,
        fechaValidacion: new Date(),
        validadoPorId: usuarioId,
        observaciones: validarDto.observaciones,
        requiereReemplazo: validarDto.requiereReemplazo || false,
      },
      include: {
        validadoPor: {
          select: { id: true, nombre: true, apellido: true },
        },
      },
    });

    return this.mapDocumentoKYC(documentoActualizado);
  }

  async obtenerDocumentosKYC(
    personaId: string,
    cooperativaId: string,
  ): Promise<DocumentoKYCDetalle[]> {
    const documentos = await this.prisma.documentoKYC.findMany({
      where: {
        personaId,
        persona: { cooperativaId },
      },
      include: {
        validadoPor: {
          select: { id: true, nombre: true, apellido: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return documentos.map(this.mapDocumentoKYC);
  }

  async obtenerHistorialKYC(
    personaId: string,
    cooperativaId: string,
  ): Promise<HistorialKYC[]> {
    const historial = await this.prisma.historialEstadoKYC.findMany({
      where: {
        personaId,
        persona: { cooperativaId },
      },
      include: {
        cambiadoPor: {
          select: { id: true, nombre: true, apellido: true },
        },
      },
      orderBy: { fechaCambio: 'desc' },
    });

    return historial.map((h) => ({
      id: h.id,
      estadoAnterior: h.estadoAnterior || undefined,
      estadoNuevo: h.estadoNuevo,
      motivo: h.motivo || undefined,
      observaciones: h.observaciones || undefined,
      fechaCambio: h.fechaCambio,
      cambiadoPor: h.cambiadoPor
        ? {
            id: h.cambiadoPor.id,
            nombre: h.cambiadoPor.nombre,
            apellido: h.cambiadoPor.apellido,
          }
        : undefined,
    }));
  }

  // ============================================
  // ESTADÍSTICAS Y REPORTES
  // ============================================

  async obtenerEstadisticasKYC(
    cooperativaId: string,
  ): Promise<EstadisticasKYC> {
    const [
      totalPersonas,
      pendientes,
      enRevision,
      aprobados,
      rechazados,
      requierenInformacion,
      documentosPendientes,
      proximosVencimientos,
    ] = await Promise.all([
      this.prisma.persona.count({ where: { cooperativaId } }),
      this.prisma.persona.count({
        where: { cooperativaId, estadoKYC: 'PENDIENTE' },
      }),
      this.prisma.persona.count({
        where: { cooperativaId, estadoKYC: 'EN_REVISION' },
      }),
      this.prisma.persona.count({
        where: { cooperativaId, estadoKYC: 'APROBADO' },
      }),
      this.prisma.persona.count({
        where: { cooperativaId, estadoKYC: 'RECHAZADO' },
      }),
      this.prisma.persona.count({
        where: { cooperativaId, estadoKYC: 'REQUIERE_INFORMACION_ADICIONAL' },
      }),
      this.prisma.documentoKYC.count({
        where: {
          persona: { cooperativaId },
          validado: false,
        },
      }),
      this.prisma.documentoKYC.count({
        where: {
          persona: { cooperativaId },
          fechaVencimiento: {
            lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Próximos 30 días
          },
        },
      }),
    ]);

    return {
      totalPersonas,
      pendientes,
      enRevision,
      aprobados,
      rechazados,
      requierenInformacionAdicional: requierenInformacion,
      documentosPendientesValidacion: documentosPendientes,
      proximosVencimientos,
    };
  }

  async obtenerResumenSocio(
    personaId: string,
    cooperativaId: string,
  ): Promise<ResumenSocio> {
    const persona = await this.prisma.persona.findFirst({
      where: { id: personaId, cooperativaId },
      include: this.getIncludePersonaDetalle(),
    });

    if (!persona) {
      throw new NotFoundException('Persona no encontrada');
    }

    // TODO: Implementar obtención real de datos de facturas, pagos y consumo
    // Aquí se conectaría con los módulos de facturación, pagos y medidores

    const resumen: ResumenSocio = {
      persona: this.mapPersonaDetalle(persona),
      facturas: {
        pendientes: 0,
        totalAdeudado: 0,
        proximoVencimiento: undefined,
      },
      pagos: {
        totalPagado: 0,
        ultimoPago: undefined,
        metodosPreferidos: [],
      },
      consumo: {
        promedioMensual: 0,
        ultimaLectura: undefined,
        tendencia: 'ESTABLE',
      },
      cuenta: {
        numeroCuenta: '',
        serviciosActivos: [],
        inmueble: {
          domicilio: '',
          localidad: '',
        },
      },
    };

    return resumen;
  }

  // ============================================
  // GESTIÓN DE USUARIOS Y AUTENTICACIÓN
  // ============================================

  async vincularUsuario(
    personaId: string,
    vincularDto: VincularUsuarioDto,
    cooperativaId: string,
    usuarioId: string,
  ): Promise<PersonaDetalle> {
    const [persona, usuario] = await Promise.all([
      this.prisma.persona.findFirst({
        where: { id: personaId, cooperativaId },
      }),
      this.prisma.usuario.findFirst({
        where: {
          id: vincularDto.usuarioId,
          cooperativas: {
            some: {
              cooperativaId,
            },
          },
        },
      }),
    ]);

    if (!persona) {
      throw new NotFoundException('Persona no encontrada');
    }

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Verificar si ya existe una vinculación
    const vinculacionExistente = await this.prisma.usuarioCooperativa.findFirst(
      {
        where: {
          usuarioId: vincularDto.usuarioId,
          cooperativaId,
          personaId: personaId,
        },
      },
    );

    if (vinculacionExistente) {
      throw new ConflictException(
        'El usuario ya está vinculado a esta persona',
      );
    }

    // Crear la vinculación
    await this.prisma.usuarioCooperativa.create({
      data: {
        usuarioId: vincularDto.usuarioId,
        cooperativaId,
        personaId: personaId,
        esEmpleado: false, // Por defecto es socio
        activo: true,
      },
    });

    const personaActualizada = await this.prisma.persona.findFirst({
      where: { id: personaId },
      include: this.getIncludePersonaDetalle(),
    });

    return this.mapPersonaDetalle(personaActualizada!);
  }

  async solicitudResetPassword(
    solicitudDto: SolicitudResetPasswordDto,
    cooperativaId: string,
    ipOrigen?: string,
    userAgent?: string,
  ): Promise<{ success: boolean; message: string }> {
    const persona = await this.prisma.persona.findFirst({
      where: {
        email: solicitudDto.email,
        cooperativaId,
        usuariosCooperativa: { some: { activo: true } },
      },
    });

    if (!persona) {
      // Por seguridad, no revelamos si el email existe o no
      return {
        success: true,
        message:
          'Si el email está registrado, recibirás un enlace para resetear tu contraseña',
      };
    }

    const token = randomBytes(32).toString('hex');
    const fechaExpira = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    await this.prisma.solicitudResetPassword.create({
      data: {
        personaId: persona.id,
        token,
        fechaExpira,
        motivo: solicitudDto.motivo,
        ipOrigen,
        userAgent,
      },
    });

    // TODO: Enviar email con el token
    // await this.emailService.enviarResetPassword(persona.email, token);

    return {
      success: true,
      message:
        'Si el email está registrado, recibirás un enlace para resetear tu contraseña',
    };
  }

  async resetPassword(
    resetDto: ResetPasswordDto,
    ipUso?: string,
  ): Promise<{ success: boolean; message: string }> {
    const solicitud = await this.prisma.solicitudResetPassword.findFirst({
      where: {
        token: resetDto.token,
        usado: false,
        fechaExpira: { gt: new Date() },
      },
      include: {
        persona: {
          include: {
            usuariosCooperativa: {
              include: {
                usuario: true,
              },
            },
          },
        },
      },
    });

    if (!solicitud) {
      throw new BadRequestException('Token inválido o expirado');
    }

    const usuarioCooperativa = solicitud.persona.usuariosCooperativa.find(
      (uc) => uc.activo,
    );
    if (!usuarioCooperativa) {
      throw new BadRequestException('Usuario no encontrado');
    }

    const usuario = usuarioCooperativa.usuario;

    const hashedPassword = await bcrypt.hash(resetDto.nuevaPassword, 12);

    await this.prisma.$transaction(async (tx) => {
      // Actualizar contraseña del usuario
      await tx.usuario.update({
        where: { id: usuario.id },
        data: { password: hashedPassword },
      });

      // Marcar token como usado
      await tx.solicitudResetPassword.update({
        where: { id: solicitud.id },
        data: {
          usado: true,
          fechaUso: new Date(),
          ipUso,
        },
      });

      // Invalidar todos los refresh tokens del usuario
      await tx.refreshToken.updateMany({
        where: { usuarioId: usuario.id },
        data: { isRevoked: true },
      });
    });

    return {
      success: true,
      message: 'Contraseña actualizada exitosamente',
    };
  }

  // ============================================
  // NOTIFICACIONES
  // ============================================

  async enviarNotificacion(
    personaId: string,
    notificacionDto: EnviarNotificacionDto,
    cooperativaId: string,
  ): Promise<NotificacionPersona> {
    const persona = await this.prisma.persona.findFirst({
      where: { id: personaId, cooperativaId },
    });

    if (!persona) {
      throw new NotFoundException('Persona no encontrada');
    }

    const notificacion = await this.prisma.notificacionPersona.create({
      data: {
        personaId,
        tipo: notificacionDto.tipo,
        categoria: notificacionDto.categoria,
        titulo: notificacionDto.titulo,
        mensaje: notificacionDto.mensaje,
        metadata: notificacionDto.metadata,
      },
    });

    // TODO: Implementar envío real según el tipo
    // await this.notificacionService.enviar(notificacion);

    return this.mapNotificacion(notificacion);
  }

  // ============================================
  // MÉTODOS PRIVADOS Y UTILIDADES
  // ============================================

  private async generarNumeroSocio(cooperativaId: string): Promise<string> {
    const ultimaPersona = await this.prisma.persona.findFirst({
      where: { cooperativaId, numeroSocio: { not: null } },
      orderBy: { numeroSocio: 'desc' },
    });

    let siguienteNumero = 1;
    if (ultimaPersona?.numeroSocio) {
      const ultimoNumero = parseInt(ultimaPersona.numeroSocio, 10);
      if (!isNaN(ultimoNumero)) {
        siguienteNumero = ultimoNumero + 1;
      }
    }

    return siguienteNumero.toString().padStart(6, '0');
  }

  private getIncludePersonaDetalle() {
    return {
      cooperativa: { select: { id: true, nombre: true } },
      usuariosCooperativa: {
        select: {
          id: true,
          usuario: {
            select: {
              id: true,
              email: true,
              activo: true,
            },
          },
          activo: true,
        },
      },
      cuentasComoTitularServicio: {
        select: {
          id: true,
          numeroCuenta: true,
          inmueble: {
            select: {
              domicilio: true,
              localidad: true,
            },
          },
        },
      },
    };
  }

  private construirWhereBusqueda(
    cooperativaId: string,
    filtros: Partial<FiltrosPersonas>,
  ) {
    const where: { [key: string]: any; fechaAlta?: Record<string, any> } = {
      cooperativaId,
    };

    if (filtros.busqueda) {
      where.OR = [
        { nombreCompleto: { contains: filtros.busqueda, mode: 'insensitive' } },
        { numeroDocumento: { contains: filtros.busqueda } },
        { email: { contains: filtros.busqueda, mode: 'insensitive' } },
        { numeroSocio: { contains: filtros.busqueda } },
      ];
    }

    if (filtros.estadoKYC) where.estadoKYC = filtros.estadoKYC;
    if (filtros.estadoSocio) where.estadoSocio = filtros.estadoSocio;
    if (filtros.tipoDocumento) where.tipoDocumento = filtros.tipoDocumento;
    if (filtros.localidad)
      where.localidadFiscal = {
        contains: filtros.localidad,
        mode: 'insensitive',
      };
    if (filtros.provincia)
      where.provinciaFiscal = {
        contains: filtros.provincia,
        mode: 'insensitive',
      };

    if (filtros.fechaAltaDesde || filtros.fechaAltaHasta) {
      where.fechaAlta = {};
      if (filtros.fechaAltaDesde)
        where.fechaAlta.gte = new Date(filtros.fechaAltaDesde);
      if (filtros.fechaAltaHasta)
        where.fechaAlta.lte = new Date(filtros.fechaAltaHasta);
    }

    if (filtros.requiereActualizacionKYC !== undefined) {
      where.requiereActualizacionKYC = filtros.requiereActualizacionKYC;
    }

    if (filtros.soloConCuentas) {
      where.cuentasComoTitularServicio = { some: {} };
    }

    if (filtros.soloSinUsuario) {
      where.usuarioVinculado = { none: {} };
    }

    return where;
  }

  private construirOrderBy(ordenarPor: string, ordenDireccion: string): any[] {
    const orderByMap: Record<string, any> = {
      nombre: { nombreCompleto: ordenDireccion },
      numeroSocio: { numeroSocio: ordenDireccion },
      fechaAlta: { fechaAlta: ordenDireccion },
      estadoKYC: { estadoKYC: ordenDireccion },
    };

    return [orderByMap[ordenarPor] || { nombreCompleto: 'asc' }];
  }

  private mapPersonaBasica = (persona: any): PersonaBasica => ({
    id: persona.id,
    nombreCompleto: persona.nombreCompleto,
    tipoDocumento: persona.tipoDocumento,
    numeroDocumento: persona.numeroDocumento,
    email: persona.email,
    telefono: persona.telefono,
    numeroSocio: persona.numeroSocio,
    estadoSocio: persona.estadoSocio,
    estadoKYC: persona.estadoKYC,
  });

  private mapPersonaDetalle = (persona: any): PersonaDetalle => ({
    id: persona.id,
    nombreCompleto: persona.nombreCompleto,
    tipoDocumento: persona.tipoDocumento,
    numeroDocumento: persona.numeroDocumento,
    categoriaIVA: persona.categoriaIVA,
    fechaNacimiento: persona.fechaNacimiento,
    estadoCivil: persona.estadoCivil,
    nacionalidad: persona.nacionalidad,
    telefono: persona.telefono,
    telefonoMovil: persona.telefonoMovil,
    email: persona.email,
    emailSecundario: persona.emailSecundario,
    domicilioActual: persona.domicilioActual,
    pisoActual: persona.pisoActual,
    codigoPostalActual: persona.codigoPostalActual,
    localidadActual: persona.localidadActual,
    departamentoActual: persona.departamentoActual,
    provinciaActual: persona.provinciaActual,
    domicilioFiscal: persona.domicilioFiscal,
    pisoFiscal: persona.pisoFiscal,
    codigoPostalFiscal: persona.codigoPostalFiscal,
    localidadFiscal: persona.localidadFiscal,
    departamentoFiscal: persona.departamentoFiscal,
    provinciaFiscal: persona.provinciaFiscal,
    ocupacion: persona.ocupacion,
    empresa: persona.empresa,
    ingresosMensuales: persona.ingresosMensuales
      ? parseFloat(persona.ingresosMensuales.toString())
      : undefined,
    numeroSocio: persona.numeroSocio,
    fechaAlta: persona.fechaAlta,
    estadoSocio: persona.estadoSocio,
    estadoKYC: persona.estadoKYC,
    fechaInicioKYC: persona.fechaInicioKYC,
    fechaCompletadoKYC: persona.fechaCompletadoKYC,
    proximaRevisionKYC: persona.proximaRevisionKYC,
    observacionesKYC: persona.observacionesKYC,
    requiereActualizacionKYC: persona.requiereActualizacionKYC,
    recibirNotificaciones: persona.recibirNotificaciones,
    recibirNotificacionesPorSMS: persona.recibirNotificacionesPorSMS,
    recibirFacturaPorEmail: persona.recibirFacturaPorEmail,
    createdAt: persona.createdAt,
    updatedAt: persona.updatedAt,
    cooperativa: persona.cooperativa,
    usuariosVinculados: persona.usuariosCooperativa || [],
    cuentasAsociadas: persona.cuentasComoTitularServicio || [],
  });

  private mapDocumentoKYC = (documento: any): DocumentoKYCDetalle => ({
    id: documento.id,
    tipoDocumento: documento.tipoDocumento,
    nombreArchivo: documento.nombreArchivo,
    urlArchivo: documento.urlArchivo,
    tamanioArchivo: documento.tamanioArchivo,
    mimeType: documento.mimeType,
    validado: documento.validado,
    fechaValidacion: documento.fechaValidacion,
    validadoPor: documento.validadoPor,
    observaciones: documento.observaciones,
    requiereReemplazo: documento.requiereReemplazo,
    fechaVencimiento: documento.fechaVencimiento,
    createdAt: documento.createdAt,
    updatedAt: documento.updatedAt,
  });

  private mapNotificacion = (notificacion: any): NotificacionPersona => ({
    id: notificacion.id,
    tipo: notificacion.tipo,
    categoria: notificacion.categoria,
    titulo: notificacion.titulo,
    mensaje: notificacion.mensaje,
    enviado: notificacion.enviado,
    fechaEnvio: notificacion.fechaEnvio,
    entregado: notificacion.entregado,
    fechaEntrega: notificacion.fechaEntrega,
    leido: notificacion.leido,
    fechaLectura: notificacion.fechaLectura,
    intentosEnvio: notificacion.intentosEnvio,
    ultimoError: notificacion.ultimoError,
    metadata: notificacion.metadata,
    createdAt: notificacion.createdAt,
  });
}
