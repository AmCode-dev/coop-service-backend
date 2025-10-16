import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  Cooperativa,
  ProcesoOnboarding,
  TipoAccion,
} from '../../generated/prisma';

import { CooperativasProgressService } from './cooperativas-progress.service';
import * as bcrypt from 'bcryptjs';
import { CrearSuperAdminDto } from './cooperativas.service';
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
    password: string;
  };
  // Información adicional de la solicitud
  motivoSolicitud?: string;
  tipoCooperativa?: string;
  numeroSocios?: number;
  serviciosRequeridos?: string[];
}

@Injectable()
export class CooperativasSuperadminsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly progressService: CooperativasProgressService,
  ) {}

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

    return solicitudes.map(
      (solicitud: ProcesoOnboarding & { cooperativa: Cooperativa }) => ({
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
      }),
    );
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
      return await this.prisma.$transaction(
        async (tx) => {
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

            return {
              aprobado: true,
              cooperativaId: proceso.cooperativaId,
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
        },
        {
          timeout: 20000, // 20 segundos para operaciones de aprobación
        },
      );
    } catch (error: unknown) {
      throw error;
    }
  }

  /**
   * Crear SUPER_ADMIN inicial del sistema
   * Método especial para configuración inicial - SOLO UNA VEZ
   */
  async crearSuperAdminInicial(data: CrearSuperAdminDto) {
    const { email, password, nombre, apellido, telefono, setupCode } = data;

    // Verificar código de setup
    const codigoRequerido = process.env.SUPER_ADMIN_SETUP_CODE || 'SETUP_2024';
    if (setupCode !== codigoRequerido) {
      throw new ConflictException('Código de setup inválido');
    }

    // Verificar que no existe ya un SUPER_ADMIN
    const existeSuperAdmin = await this.prisma.usuarioRol.findFirst({
      include: {
        rol: true,
      },
      where: {
        rol: {
          nombre: 'SUPER_ADMIN',
        },
      },
    });

    if (existeSuperAdmin) {
      throw new ConflictException('Ya existe un SUPER_ADMIN en el sistema');
    }

    // Verificar que no existe un usuario con ese email
    const existeUsuario = await this.prisma.usuario.findUnique({
      where: { email },
      select: { id: true },
    });
    if (existeUsuario) {
      throw new ConflictException(`Ya existe un usuario con el email ${email}`);
    }

    try {
      return await this.prisma.$transaction(
        async (tx) => {
          // 1. Crear cooperativa sistema
          const cooperativaSistema = await tx.cooperativa.create({
            data: {
              nombre: 'Sistema Central',
              razonSocial: 'Sistema Central de Gestión Cooperativas',
              cuit: '30-99999999-9',
              domicilio: 'Sistema Central 123',
              localidad: 'Buenos Aires',
              provincia: 'Buenos Aires',
              codigoPostal: '1000',
              telefono: '+54-11-0000-0000',
              email: 'sistema@cooperativas.com',
              activa: true,
            },
          });

          // 2. Crear sección SYSTEM
          const seccionSistema = await tx.seccionSistema.create({
            data: {
              nombre: 'Administración del Sistema',
              codigo: 'SYSTEM',
              descripcion: 'Administración global del sistema y cooperativas',
              icono: 'settings',
              orden: 0,
              activa: true,
              cooperativaId: cooperativaSistema.id,
            },
          });

          // 3. Crear rol SUPER_ADMIN
          const rolSuperAdmin = await tx.rol.create({
            data: {
              nombre: 'SUPER_ADMIN',
              descripcion: 'Administrador del Sistema con acceso global',
              esSistema: true,
              activo: true,
              cooperativaId: cooperativaSistema.id,
            },
          });

          // 4. Asignar todos los permisos al rol
          const permisos = ['READ', 'WRITE', 'EXECUTE', 'DELETE'];
          for (const permiso of permisos) {
            await tx.rolPermiso.create({
              data: {
                rolId: rolSuperAdmin.id,
                seccionId: seccionSistema.id,
                accion: permiso as TipoAccion,
              },
            });
          }

          // 5. Crear usuario SUPER_ADMIN
          const hashPassword = await bcrypt.hash(password, 12);
          const superAdminUser = await tx.usuario.create({
            data: {
              email,
              password: hashPassword,
              nombre,
              apellido,
              telefono,
              activo: true,
            },
          });

          // 6. Crear relación usuario-cooperativa
          const usuarioCooperativa = await tx.usuarioCooperativa.create({
            data: {
              usuarioId: superAdminUser.id,
              cooperativaId: cooperativaSistema.id,
              esEmpleado: true,
              activo: true,
            },
          });

          // 7. Asignar rol SUPER_ADMIN al usuario
          await tx.usuarioRol.create({
            data: {
              usuarioCooperativaId: usuarioCooperativa.id,
              rolId: rolSuperAdmin.id,
            },
          });

          return {
            usuario: {
              id: superAdminUser.id,
              email: superAdminUser.email,
              nombre: superAdminUser.nombre,
              apellido: superAdminUser.apellido,
            },
            cooperativaSistema: {
              id: cooperativaSistema.id,
              nombre: cooperativaSistema.nombre,
            },
            rol: {
              id: rolSuperAdmin.id,
              nombre: rolSuperAdmin.nombre,
            },
            mensaje:
              'SUPER_ADMIN creado exitosamente. Sistema listo para usar.',
            credenciales: {
              email,
              nota: 'Contraseña configurada según solicitud',
            },
            proximosPasos: [
              'Configura SUPER_ADMIN_ACCESS_CODE en las variables de entorno',
              'Usa /auth/super-admin/login para acceder',
              'Cambia la contraseña después del primer login',
            ],
          };
        },
        {
          timeout: 30000, // 30 segundos para setup completo
        },
      );
    } catch (error: unknown) {
      if (this.isPrismaError(error, 'P2002')) {
        throw new ConflictException(
          'Ya existe un elemento del sistema con esos datos únicos',
        );
      }
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
