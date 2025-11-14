import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthenticatedUser } from '../interfaces/auth.interface';

@Injectable()
export class SuperAdminService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Verifica si un usuario es SUPER_ADMIN
   */
  isSuperAdmin(user: AuthenticatedUser): boolean {
    return (
      user.roles.some(
        (role) => role.nombre === 'SUPER_ADMIN' || role.esSistema === true,
      ) || user.permisos.some((permiso) => permiso.seccionCodigo === 'SYSTEM')
    );
  }

  /**
   * Obtener todas las cooperativas (solo SUPER_ADMIN)
   */
  async getAllCooperativas() {
    return this.prisma.cooperativa.findMany({
      include: {
        _count: {
          select: {
            usuariosMultiTenant: true,
            cuentas: true,
            servicios: true,
          },
        },
      },
      orderBy: { nombre: 'asc' },
    });
  }

  /**
   * Obtener datos de cualquier cooperativa específica (solo SUPER_ADMIN)
   */
  async getCooperativaById(cooperativaId: number) {
    return this.prisma.cooperativa.findUnique({
      where: { id: cooperativaId },
      include: {
        usuariosMultiTenant: {
          include: {
            usuario: {
              select: {
                id: true,
                email: true,
                nombre: true,
                apellido: true,
                telefono: true,
                activo: true,
                createdAt: true,
              },
            },
          },
        },
        servicios: true,
        cuentas: {
          take: 20,
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            usuariosMultiTenant: true,
            cuentas: true,
            servicios: true,
          },
        },
      },
    });
  }

  /**
   * Obtener estadísticas globales de todas las cooperativas (solo SUPER_ADMIN)
   */
  async getEstadisticasGlobales() {
    const [
      totalCooperativas,
      cooperativasActivas,
      totalUsuarios,
      usuariosActivos,
      totalCuentas,
    ] = await Promise.all([
      this.prisma.cooperativa.count(),
      this.prisma.cooperativa.count({ where: { activa: true } }),
      this.prisma.usuario.count(),
      this.prisma.usuario.count({ where: { activo: true } }),
      this.prisma.cuenta.count(),
    ]);

    return {
      resumenGeneral: {
        totalCooperativas,
        cooperativasActivas,
        totalUsuarios,
        usuariosActivos,
        totalCuentas,
      },
    };
  }

  /**
   * Buscar en todas las cooperativas (solo SUPER_ADMIN)
   */
  async buscarGlobal(termino: string) {
    const [cooperativas, usuarios] = await Promise.all([
      // Buscar cooperativas
      this.prisma.cooperativa.findMany({
        where: {
          OR: [
            { nombre: { contains: termino, mode: 'insensitive' } },
            { razonSocial: { contains: termino, mode: 'insensitive' } },
            { cuit: { contains: termino } },
            { email: { contains: termino, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          nombre: true,
          razonSocial: true,
          cuit: true,
          email: true,
          activa: true,
        },
        take: 10,
      }),

      // Buscar usuarios
      this.prisma.usuario.findMany({
        where: {
          OR: [
            { nombre: { contains: termino, mode: 'insensitive' } },
            { apellido: { contains: termino, mode: 'insensitive' } },
            { email: { contains: termino, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          email: true,
          nombre: true,
          apellido: true,
          activo: true,
        },
        take: 10,
      }),
    ]);

    return {
      cooperativas,
      usuarios,
      total: cooperativas.length + usuarios.length,
    };
  }

  /**
   * Cambiar estado de cualquier cooperativa (solo SUPER_ADMIN)
   */
  async cambiarEstadoCooperativa(cooperativaId: number, activa: boolean) {
    return this.prisma.cooperativa.update({
      where: { id: cooperativaId },
      data: { activa },
      include: {
        _count: {
          select: {
            usuariosMultiTenant: true,
            cuentas: true,
            servicios: true,
          },
        },
      },
    });
  }
}
