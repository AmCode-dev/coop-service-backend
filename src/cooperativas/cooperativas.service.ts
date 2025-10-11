import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Cooperativa, PrismaClient, TipoAccion } from '../../generated/prisma';

export interface CreateCooperativaDto {
  nombre: string;
  razonSocial: string;
  cuit: string;
  domicilio: string;
  localidad: string;
  provincia: string;
  codigoPostal: string;
  telefono?: string;
  email?: string;
  logo?: string;
}

export interface UpdateCooperativaDto extends Partial<CreateCooperativaDto> {
  activa?: boolean;
}

export interface BootstrapCooperativaDto {
  cooperativa: CreateCooperativaDto;
  administrador: {
    email: string;
    password: string;
    nombre: string;
    apellido: string;
    telefono?: string;
  };
}

export interface SolicitudAccesoCooperativaDto {
  // Datos de la cooperativa
  cooperativa: CreateCooperativaDto;
  // Datos del solicitante (quien será el admin)
  solicitante: {
    email: string;
    nombre: string;
    apellido: string;
    telefono?: string;
    documento: string;
    tipoDocumento?: 'DNI' | 'PASAPORTE' | 'CEDULA';
    fechaNacimiento?: Date;
  };
  // Información adicional de la solicitud
  motivoSolicitud?: string;
  tipoCooperativa?: string;
  numeroSocios?: number;
  serviciosRequeridos?: string[];
}

type prismaTransaction = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$extends'
>;

@Injectable()
export class CooperativasService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Cooperativa[]> {
    return this.prisma.cooperativa.findMany({
      where: { activa: true },
      orderBy: { nombre: 'asc' },
    });
  }

  async findOne(id: string): Promise<Cooperativa> {
    const cooperativa = await this.prisma.cooperativa.findUnique({
      where: { id },
      include: {
        usuariosMultiTenant: {
          select: {
            id: true,
            activo: true,
            usuario: {
              select: {
                id: true,
                email: true,
                nombre: true,

                activo: true,
              },
            },
          },
        },
        servicios: true,
        _count: {
          select: {
            usuariosMultiTenant: true,
            cuentas: true,
            servicios: true,
          },
        },
      },
    });

    if (!cooperativa) {
      throw new NotFoundException(`Cooperativa con ID ${id} no encontrada`);
    }

    return cooperativa;
  }

  async create(data: CreateCooperativaDto): Promise<Cooperativa> {
    try {
      return await this.prisma.cooperativa.create({
        data,
      });
    } catch (error: unknown) {
      if (this.isPrismaError(error, 'P2002')) {
        throw new ConflictException(
          `Ya existe una cooperativa con el CUIT ${data.cuit}`,
        );
      }
      throw error;
    }
  }

  async update(id: string, data: UpdateCooperativaDto): Promise<Cooperativa> {
    try {
      return await this.prisma.cooperativa.update({
        where: { id },
        data,
      });
    } catch (error: unknown) {
      if (this.isPrismaError(error, 'P2025')) {
        throw new NotFoundException(`Cooperativa con ID ${id} no encontrada`);
      }
      if (this.isPrismaError(error, 'P2002')) {
        throw new ConflictException(
          `Ya existe una cooperativa con el CUIT ${data.cuit}`,
        );
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      // Soft delete - marcamos como inactiva en lugar de eliminar
      await this.prisma.cooperativa.update({
        where: { id },
        data: { activa: false },
      });
    } catch (error: unknown) {
      if (this.isPrismaError(error, 'P2025')) {
        throw new NotFoundException(`Cooperativa con ID ${id} no encontrada`);
      }
      throw error;
    }
  }

  async findByCuit(cuit: string): Promise<Cooperativa | null> {
    return this.prisma.cooperativa.findUnique({
      where: { cuit },
    });
  }

  async getStats(id: string) {
    const cooperativa = await this.findOne(id);

    const [usuarios, cuentas, facturas, servicios] = await Promise.all([
      this.prisma.usuarioCooperativa.count({
        where: { cooperativaId: id, activo: true },
      }),
      this.prisma.cuenta.count({ where: { cooperativaId: id } }),
      this.prisma.factura.count({ where: { cuenta: { cooperativaId: id } } }),
      this.prisma.servicioDisponible.count({ where: { cooperativaId: id } }),
    ]);

    return {
      cooperativa: {
        id: cooperativa.id,
        nombre: cooperativa.nombre,
        razonSocial: cooperativa.razonSocial,
      },
      estadisticas: {
        usuarios,
        cuentas,
        facturas,
        servicios,
      },
    };
  }

  /**
   * Verifica si existe una cooperativa con el CUIT dado
   */
  async existeByCuit(cuit: string): Promise<boolean> {
    const cooperativa = await this.prisma.cooperativa.findUnique({
      where: { cuit },
      select: { id: true },
    });
    return !!cooperativa;
  }

  /**
   * Bootstrap: Crea una cooperativa con su administrador inicial
   * Este método NO requiere autenticación y está diseñado para setup inicial
   */
  async bootstrapCooperativa(data: BootstrapCooperativaDto) {
    const { cooperativa: cooperativaData, administrador } = data;

    // Verificar que no existe una cooperativa con ese CUIT
    const existeCooperativa = await this.existeByCuit(cooperativaData.cuit);
    if (existeCooperativa) {
      throw new ConflictException(
        `Ya existe una cooperativa con el CUIT ${cooperativaData.cuit}`,
      );
    }

    // Verificar que no existe un usuario con ese email
    const existeUsuario = await this.prisma.usuario.findUnique({
      where: { email: administrador.email },
      select: { id: true },
    });
    if (existeUsuario) {
      throw new ConflictException(
        `Ya existe un usuario con el email ${administrador.email}`,
      );
    }

    try {
      // Usar transacción para asegurar consistencia
      return await this.prisma.$transaction(async (tx) => {
        // 1. Crear la cooperativa
        const nuevaCooperativa = await tx.cooperativa.create({
          data: cooperativaData,
        });

        // 2. Crear configuración inicial (roles, secciones, onboarding)
        await this.configurarCooperativaInicial(tx, nuevaCooperativa.id);

        // 3. Crear el usuario administrador
        // Por ahora sin hash de password - se puede implementar después
        const hashPassword = administrador.password; // TODO: usar bcrypt.hash(administrador.password, 10)

        const nuevoAdmin = await tx.usuario.create({
          data: {
            email: administrador.email,
            password: hashPassword,
            nombre: administrador.nombre,
            apellido: administrador.apellido,
            telefono: administrador.telefono,
          },
        });

        // Crear relación usuario-cooperativa
        const usuarioCooperativa = await tx.usuarioCooperativa.create({
          data: {
            usuarioId: nuevoAdmin.id,
            cooperativaId: nuevaCooperativa.id,
            esEmpleado: true,
          },
        });

        // 4. Asignar rol de Administrador
        const rolAdmin = await tx.rol.findFirst({
          where: {
            cooperativaId: nuevaCooperativa.id,
            nombre: 'Administrador',
          },
        });

        if (rolAdmin) {
          await tx.usuarioRol.create({
            data: {
              usuarioCooperativaId: usuarioCooperativa.id,
              rolId: rolAdmin.id,
            },
          });
        }

        return {
          cooperativa: {
            id: nuevaCooperativa.id,
            nombre: nuevaCooperativa.nombre,
            cuit: nuevaCooperativa.cuit,
          },
          administrador: {
            id: nuevoAdmin.id,
            email: nuevoAdmin.email,
            nombre: nuevoAdmin.nombre,
            apellido: nuevoAdmin.apellido,
          },
          mensaje:
            'Sistema configurado correctamente. Ya puedes iniciar sesión.',
        };
      });
    } catch (error: unknown) {
      if (this.isPrismaError(error, 'P2002')) {
        throw new ConflictException(
          'Ya existe una cooperativa o usuario con esos datos',
        );
      }
      throw error;
    }
  }

  /**
   * Configura los elementos iniciales de una cooperativa
   */
  private async configurarCooperativaInicial(
    tx: prismaTransaction,
    cooperativaId: string,
  ) {
    // Crear secciones del sistema
    await this.crearSeccionesDefecto(tx, cooperativaId);

    // Crear roles por defecto
    await this.crearRolesDefecto(tx, cooperativaId);

    // Crear configuración de onboarding
    await this.crearConfiguracionOnboardingDefecto(tx, cooperativaId);
  }

  /**
   * Crear secciones del sistema por defecto
   */
  private async crearSeccionesDefecto(
    tx: prismaTransaction,
    cooperativaId: string,
  ) {
    const secciones = [
      {
        nombre: 'Inmuebles',
        codigo: 'inmuebles',
        descripcion: 'Gestión de inmuebles, titularidad y legajos',
        icono: 'building',
        orden: 1,
      },
      {
        nombre: 'Cuentas',
        codigo: 'cuentas',
        descripcion: 'Gestión de cuentas de servicios',
        icono: 'account-box',
        orden: 2,
      },
      {
        nombre: 'Facturación',
        codigo: 'facturacion',
        descripcion: 'Gestión de facturación y conceptos',
        icono: 'receipt',
        orden: 3,
      },
      {
        nombre: 'Usuarios',
        codigo: 'usuarios',
        descripcion: 'Gestión de usuarios y permisos',
        icono: 'people',
        orden: 4,
      },
      {
        nombre: 'Cooperativas',
        codigo: 'cooperativas',
        descripcion: 'Gestión de datos de la cooperativa',
        icono: 'business',
        orden: 5,
      },
    ];

    for (const seccion of secciones) {
      await tx.seccionSistema.create({
        data: {
          ...seccion,
          cooperativaId,
        },
      });
    }
  }

  /**
   * Crear roles por defecto
   */
  private async crearRolesDefecto(
    tx: prismaTransaction,
    cooperativaId: string,
  ) {
    const roles = [
      {
        nombre: 'Administrador',
        descripcion: 'Acceso total al sistema',
        esSistema: true,
      },
      {
        nombre: 'Operador',
        descripcion: 'Gestión operativa de inmuebles y cuentas',
        esSistema: true,
      },
      {
        nombre: 'Contador',
        descripcion: 'Gestión de facturación y reportes financieros',
        esSistema: true,
      },
      {
        nombre: 'Socio',
        descripcion: 'Acceso limitado a información personal',
        esSistema: true,
      },
    ];

    for (const rol of roles) {
      const rolCreado = await tx.rol.create({
        data: {
          ...rol,
          cooperativaId,
        },
      });

      // Asignar permisos básicos según el rol
      await this.asignarPermisosDefecto(
        tx,
        rolCreado.id,
        rol.nombre,
        cooperativaId,
      );
    }
  }

  /**
   * Asignar permisos por defecto según el rol
   */
  private async asignarPermisosDefecto(
    tx: any,
    rolId: string,
    nombreRol: string,
    cooperativaId: string,
  ) {
    // Obtener todas las secciones
    const secciones = await tx.seccionSistema.findMany({
      where: { cooperativaId },
    });

    const permisosPorRol = {
      Administrador: ['READ', 'WRITE', 'EXECUTE', 'DELETE'],
      Operador: ['READ', 'WRITE', 'EXECUTE'],
      Contador: ['READ', 'WRITE'],
      Socio: ['READ'],
    };

    const permisos = permisosPorRol[
      nombreRol as keyof typeof permisosPorRol
    ] || ['READ'];

    for (const seccion of secciones) {
      for (const permiso of permisos) {
        await tx.rolPermiso.create({
          data: {
            rolId,
            seccionId: seccion.id,
            accion: permiso as TipoAccion,
          },
        });
      }
    }
  }

  /**
   * Crear configuración de onboarding por defecto
   */
  private async crearConfiguracionOnboardingDefecto(
    tx: any,
    cooperativaId: string,
  ) {
    await tx.configuracionOnboarding.create({
      data: {
        cooperativaId,
        activado: true,
        requiereAprobacionManual: false,
        tiempoLimiteOnboarding: 30,
        pasosObligatorios: [
          'DATOS_PERSONALES',
          'DOCUMENTACION',
          'ACEPTACION_TERMINOS',
        ],
        pasosOpcionales: ['CONFIGURACION_SERVICIOS'],
        documentosRequeridos: ['DNI'],
        documentosOpcionales: ['COMPROBANTE_DOMICILIO'],
        requiereValidacionEmail: true,
        requiereValidacionTelefono: false,
        crearCuentaAutomatica: true,
      },
    });
  }

  /**
   * Solicitar acceso a través de onboarding completo
   * Crea un proceso de onboarding para una nueva cooperativa
   */
  async solicitarAccesoCooperativa(data: SolicitudAccesoCooperativaDto) {
    const { cooperativa: cooperativaData, solicitante } = data;

    // Verificar que no existe una cooperativa con ese CUIT
    const existeCooperativa = await this.existeByCuit(cooperativaData.cuit);
    if (existeCooperativa) {
      throw new ConflictException(
        `Ya existe una cooperativa con el CUIT ${cooperativaData.cuit}`,
      );
    }

    // Verificar que no existe un usuario con ese email
    const existeUsuario = await this.prisma.usuario.findUnique({
      where: { email: solicitante.email },
      select: { id: true },
    });
    if (existeUsuario) {
      throw new ConflictException(
        `Ya existe un usuario con el email ${solicitante.email}`,
      );
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        // 1. Crear cooperativa en estado "PENDIENTE" (inactiva)
        const nuevaCooperativa = await tx.cooperativa.create({
          data: {
            ...cooperativaData,
            activa: false, // Inactiva hasta completar onboarding
          },
        });

        // 2. Crear configuración básica
        await this.configurarCooperativaInicial(tx, nuevaCooperativa.id);

        // 3. Generar código de referencia único
        const codigoReferencia = this.generarCodigoReferencia();

        // 4. Crear proceso de onboarding simplificado
        const procesoData = {
          cooperativaId: nuevaCooperativa.id,
          email: solicitante.email,
          nombre: solicitante.nombre,
          apellido: solicitante.apellido,
          telefono: solicitante.telefono,
          documento: solicitante.documento,
          codigoReferencia,
          fechaVencimiento: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 días
          pasosPendientes: [
            'DATOS_PERSONALES',
            'DOCUMENTACION_COOPERATIVA',
            'DOCUMENTACION_PERSONAL',
            'VERIFICACION_IDENTIDAD',
            'VALIDACION_COOPERATIVA',
            'ACEPTACION_TERMINOS',
          ],
          requiereAprobacion: true,
          origenSolicitud: 'SOLICITUD_ACCESO_COOPERATIVA',
        };

        const procesoOnboarding = await tx.procesoOnboarding.create({
          data: procesoData,
        });

        return {
          cooperativaId: nuevaCooperativa.id,
          procesoOnboardingId: procesoOnboarding.id,
          codigoReferencia: procesoOnboarding.codigoReferencia,
          fechaVencimiento: procesoOnboarding.fechaVencimiento,
          mensaje:
            'Solicitud registrada. Te hemos enviado un email con los próximos pasos.',
          proximosPasos: [
            'Revisa tu email para continuar el proceso',
            'Sube la documentación requerida',
            'Completa la verificación de identidad',
            'Espera la aprobación del equipo',
          ],
        };
      });
    } catch (error: unknown) {
      if (this.isPrismaError(error, 'P2002')) {
        throw new ConflictException('Ya existe una solicitud con esos datos');
      }
      throw error;
    }
  }

  /**
   * Obtener estado de una solicitud de acceso
   */
  async obtenerEstadoSolicitud(codigoReferencia: string) {
    const proceso = await this.prisma.procesoOnboarding.findFirst({
      where: { codigoReferencia },
      include: {
        cooperativa: {
          select: {
            nombre: true,
            cuit: true,
            activa: true,
          },
        },
      },
    });

    if (!proceso) {
      throw new NotFoundException('Solicitud no encontrada');
    }

    return {
      solicitud: {
        codigoReferencia: proceso.codigoReferencia,
        estado: proceso.estado,
        fechaCreacion: proceso.createdAt,
        fechaVencimiento: proceso.fechaVencimiento,
      },
      cooperativa: {
        nombre: proceso.cooperativa.nombre,
        cuit: proceso.cooperativa.cuit,
        activa: proceso.cooperativa.activa,
      },
      solicitante: {
        nombre: proceso.nombre,
        apellido: proceso.apellido,
        email: proceso.email,
      },
      mensaje: this.generarMensajeEstado(proceso.estado),
      siguientesPasos: this.generarSiguientesPasos(proceso.estado),
    };
  }

  /**
   * Generar código de referencia único
   */
  private generarCodigoReferencia(): string {
    const fecha = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `COOP-${fecha}-${random}`;
  }

  /**
   * Generar mensaje según el estado
   */
  private generarMensajeEstado(estado: string): string {
    switch (estado) {
      case 'INICIADO':
        return 'Tu solicitud ha sido iniciada. Continúa con los siguientes pasos.';
      case 'EN_PROGRESO':
        return 'Tu solicitud está en progreso. Continúa completando la documentación.';
      case 'PENDIENTE_VALIDACION':
        return 'Documentación recibida. Estamos validando la información.';
      case 'PENDIENTE_APROBACION':
        return 'Tu solicitud está siendo revisada por nuestro equipo.';
      case 'COMPLETADO':
        return '¡Felicitaciones! Tu cooperativa ha sido aprobada y ya puedes acceder al sistema.';
      case 'RECHAZADO':
        return 'Lamentablemente tu solicitud ha sido rechazada. Contacta al equipo de soporte.';
      default:
        return 'Estado de solicitud: ' + estado;
    }
  }

  /**
   * Generar siguientes pasos según el estado
   */
  private generarSiguientesPasos(estado: string): string[] {
    switch (estado) {
      case 'INICIADO':
        return [
          'Accede al proceso de onboarding con tu código de referencia',
          'Completa tus datos personales',
          'Sube la documentación de la cooperativa',
        ];
      case 'EN_PROGRESO':
        return [
          'Sube todos los documentos requeridos',
          'Completa la verificación de identidad',
          'Acepta los términos y condiciones',
        ];
      case 'PENDIENTE_VALIDACION':
        return [
          'Espera la validación de documentos',
          'Responde a cualquier solicitud adicional por email',
        ];
      case 'PENDIENTE_APROBACION':
        return [
          'Tu solicitud está siendo revisada',
          'Recibirás un email con la decisión final',
        ];
      case 'COMPLETADO':
        return [
          'Ya puedes acceder al sistema',
          'Inicia sesión con las credenciales enviadas por email',
        ];
      case 'RECHAZADO':
        return [
          'Contacta al equipo de soporte para más información',
          'Revisa los motivos del rechazo en tu email',
        ];
      default:
        return ['Consulta el estado de tu solicitud regularmente'];
    }
  }

  /**
   * Listar todas las solicitudes de acceso pendientes (solo SUPER_ADMIN)
   */
  async listarSolicitudesPendientes() {
    const solicitudes = await this.prisma.procesoOnboarding.findMany({
      where: {
        origenSolicitud: 'SOLICITUD_ACCESO_COOPERATIVA',
        estado: {
          in: [
            'INICIADO',
            'EN_PROGRESO',
            'PENDIENTE_VALIDACION',
            'PENDIENTE_APROBACION',
          ],
        },
      },
      include: {
        cooperativa: {
          select: {
            nombre: true,
            cuit: true,
            domicilio: true,
            localidad: true,
            provincia: true,
            activa: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return solicitudes.map((solicitud: any) => ({
      procesoId: solicitud.id,
      codigoReferencia: solicitud.codigoReferencia,
      estado: solicitud.estado,
      fechaCreacion: solicitud.createdAt,
      fechaVencimiento: solicitud.fechaVencimiento,
      cooperativa: {
        nombre: solicitud.cooperativa.nombre,
        cuit: solicitud.cooperativa.cuit,
        domicilio: solicitud.cooperativa.domicilio,
        localidad: solicitud.cooperativa.localidad,
        provincia: solicitud.cooperativa.provincia,
        activa: solicitud.cooperativa.activa,
      },
      solicitante: {
        nombre: solicitud.nombre,
        apellido: solicitud.apellido,
        email: solicitud.email,
        telefono: solicitud.telefono,
      },
      diasRestantes: Math.ceil(
        (new Date(solicitud.fechaVencimiento || new Date()).getTime() -
          Date.now()) /
          (1000 * 60 * 60 * 24),
      ),
    }));
  }

  /**
   * Decidir sobre una solicitud de acceso (aprobar/rechazar - solo SUPER_ADMIN)
   */
  async decidirSolicitudAcceso(
    codigoReferencia: string,
    decision: {
      aprobado: boolean;
      observaciones?: string;
      motivoRechazo?: string;
    },
    usuarioId: string,
  ) {
    const proceso = await this.prisma.procesoOnboarding.findFirst({
      where: {
        codigoReferencia,
        origenSolicitud: 'SOLICITUD_ACCESO_COOPERATIVA',
      },
      include: {
        cooperativa: true,
      },
    });

    if (!proceso) {
      throw new NotFoundException('Solicitud no encontrada');
    }

    // eslint-disable-next-line no-useless-catch
    try {
      return await this.prisma.$transaction(async (tx) => {
        if (decision.aprobado) {
          // Aprobar solicitud
          await tx.procesoOnboarding.update({
            where: { id: proceso.id },
            data: {
              estado: 'COMPLETADO',
              observacionesInternas:
                decision.observaciones ||
                'Solicitud aprobada por Super Administrador',
              fechaFinalizacion: new Date(),
              usuarioAprobadorId: usuarioId,
            },
          });

          // Activar la cooperativa
          await tx.cooperativa.update({
            where: { id: proceso.cooperativaId },
            data: { activa: true },
          });

          // Crear usuario administrador
          const hashPassword = 'temporal123'; // TODO: Generar password temporal y enviarlo por email

          const nuevoAdmin = await tx.usuario.create({
            data: {
              email: proceso.email,
              password: hashPassword,
              nombre: proceso.nombre,
              apellido: proceso.apellido,
              telefono: proceso.telefono,
            },
          });

          // Crear relación usuario-cooperativa
          const usuarioCooperativa = await tx.usuarioCooperativa.create({
            data: {
              usuarioId: nuevoAdmin.id,
              cooperativaId: proceso.cooperativaId,
              esEmpleado: true,
            },
          });

          // Asignar rol de Administrador
          const rolAdmin = await tx.rol.findFirst({
            where: {
              cooperativaId: proceso.cooperativaId,
              nombre: 'Administrador',
            },
          });

          if (rolAdmin) {
            await tx.usuarioRol.create({
              data: {
                usuarioCooperativaId: usuarioCooperativa.id,
                rolId: rolAdmin.id,
              },
            });
          }

          return {
            aprobado: true,
            cooperativaId: proceso.cooperativaId,
            administrador: {
              id: nuevoAdmin.id,
              email: nuevoAdmin.email,
              nombre: nuevoAdmin.nombre,
              apellido: nuevoAdmin.apellido,
            },
            mensaje:
              'Solicitud aprobada. Cooperativa activada y administrador creado.',
          };
        } else {
          // Rechazar solicitud
          await tx.procesoOnboarding.update({
            where: { id: proceso.id },
            data: {
              estado: 'RECHAZADO',
              observacionesInternas:
                decision?.motivoRechazo ||
                'Solicitud rechazada por Super Administrador',
              fechaFinalizacion: new Date(),
              usuarioAprobadorId: usuarioId,
            },
          });

          return {
            aprobado: false,
            motivo: decision.motivoRechazo,
            mensaje: 'Solicitud rechazada.',
          };
        }
      });
    } catch (error: unknown) {
      throw error;
    }
  }

  private isPrismaError(error: unknown, code: string): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === code
    );
  }
}
