import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServicioDto, UpdateServicioDto } from './dto/servicio.dto';

@Injectable()
export class ServiciosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createServicioDto: CreateServicioDto, cooperativaId: string, usuarioId: string) {
    // Verificar que el código no existe para esta cooperativa
    const existingServicio = await this.prisma.servicioDisponible.findFirst({
      where: {
        cooperativaId,
        codigo: createServicioDto.codigo,
      },
    });

    if (existingServicio) {
      throw new ConflictException(
        `Ya existe un servicio con el código '${createServicioDto.codigo}' en esta cooperativa`,
      );
    }

    // Crear el servicio
    return this.prisma.servicioDisponible.create({
      data: {
        ...createServicioDto,
        cooperativaId,
        activo: createServicioDto.activo ?? true,
      },
      include: {
        categorias: {
          where: { activo: true },
          orderBy: [{ numero: 'asc' }, { nombre: 'asc' }],
        },
        _count: {
          select: {
            categorias: true,
            cuentasServicios: true,
          },
        },
      },
    });
  }

  async findAll(cooperativaId: string, includeInactive = false) {
    const where = {
      cooperativaId,
      ...(includeInactive ? {} : { activo: true }),
    };

    return this.prisma.servicioDisponible.findMany({
      where,
      include: {
        categorias: {
          where: { activo: true },
          orderBy: [{ numero: 'asc' }, { nombre: 'asc' }],
          include: {
            _count: {
              select: {
                historialPrecios: true,
                cuentasServicios: true,
              },
            },
          },
        },
        _count: {
          select: {
            categorias: true,
            cuentasServicios: true,
          },
        },
      },
      orderBy: [{ nombre: 'asc' }],
    });
  }

  async findOne(id: string, cooperativaId: string) {
    const servicio = await this.prisma.servicioDisponible.findFirst({
      where: { id, cooperativaId },
      include: {
        categorias: {
          where: { activo: true },
          orderBy: [{ numero: 'asc' }, { nombre: 'asc' }],
          include: {
            historialPrecios: {
              orderBy: { vigenciaDesde: 'desc' },
              take: 1, // Solo el precio más reciente
            },
            _count: {
              select: {
                historialPrecios: true,
                cuentasServicios: true,
              },
            },
          },
        },
        _count: {
          select: {
            categorias: true,
            cuentasServicios: true,
          },
        },
      },
    });

    if (!servicio) {
      throw new NotFoundException(`Servicio con ID '${id}' no encontrado`);
    }

    return servicio;
  }

  async update(id: string, updateServicioDto: UpdateServicioDto, cooperativaId: string) {
    // Verificar que el servicio existe
    const servicio = await this.prisma.servicioDisponible.findFirst({
      where: { id, cooperativaId },
    });

    if (!servicio) {
      throw new NotFoundException(`Servicio con ID '${id}' no encontrado`);
    }

    // Actualizar el servicio
    return this.prisma.servicioDisponible.update({
      where: { id },
      data: updateServicioDto,
      include: {
        categorias: {
          where: { activo: true },
          orderBy: [{ numero: 'asc' }, { nombre: 'asc' }],
        },
        _count: {
          select: {
            categorias: true,
            cuentasServicios: true,
          },
        },
      },
    });
  }

  async remove(id: string, cooperativaId: string) {
    // Verificar que el servicio existe
    const servicio = await this.prisma.servicioDisponible.findFirst({
      where: { id, cooperativaId },
      include: {
        _count: {
          select: {
            categorias: true,
            cuentasServicios: true,
          },
        },
      },
    });

    if (!servicio) {
      throw new NotFoundException(`Servicio con ID '${id}' no encontrado`);
    }

    // Verificar que no tenga categorías o cuentas asociadas
    if (servicio._count.categorias > 0) {
      throw new BadRequestException(
        'No se puede eliminar el servicio porque tiene categorías asociadas',
      );
    }

    if (servicio._count.cuentasServicios > 0) {
      throw new BadRequestException(
        'No se puede eliminar el servicio porque tiene cuentas asociadas',
      );
    }

    // Eliminar el servicio (soft delete)
    return this.prisma.servicioDisponible.update({
      where: { id },
      data: { activo: false },
    });
  }

  async findByCode(codigo: string, cooperativaId: string) {
    return this.prisma.servicioDisponible.findFirst({
      where: {
        codigo,
        cooperativaId,
        activo: true,
      },
      include: {
        categorias: {
          where: { activo: true },
          orderBy: [{ numero: 'asc' }, { nombre: 'asc' }],
        },
      },
    });
  }

  async getEstadisticas(cooperativaId: string) {
    const servicios = await this.prisma.servicioDisponible.findMany({
      where: { cooperativaId },
      include: {
        _count: {
          select: {
            categorias: true,
            cuentasServicios: true,
          },
        },
      },
    });

    const totalServicios = servicios.length;
    const serviciosActivos = servicios.filter((s) => s.activo).length;
    const totalCategorias = servicios.reduce((sum, s) => sum + s._count.categorias, 0);
    const totalCuentasServicios = servicios.reduce((sum, s) => sum + s._count.cuentasServicios, 0);

    return {
      totalServicios,
      serviciosActivos,
      serviciosInactivos: totalServicios - serviciosActivos,
      totalCategorias,
      totalCuentasServicios,
      promedioCategoriasporServicio: totalServicios > 0 ? totalCategorias / totalServicios : 0,
    };
  }
}