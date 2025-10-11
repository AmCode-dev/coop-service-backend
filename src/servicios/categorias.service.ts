import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoriaDto, UpdateCategoriaDto } from './dto/categoria.dto';

@Injectable()
export class CategoriasService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createCategoriaDto: CreateCategoriaDto,
    cooperativaId: string,
    usuarioId: string,
  ) {
    // Verificar que el servicio existe y pertenece a la cooperativa
    const servicio = await this.prisma.servicioDisponible.findFirst({
      where: {
        id: createCategoriaDto.servicioId,
        cooperativaId,
        activo: true,
      },
    });

    if (!servicio) {
      throw new NotFoundException(
        `Servicio con ID '${createCategoriaDto.servicioId}' no encontrado`,
      );
    }

    // Verificar que el código no existe para este servicio
    const existingCategoria = await this.prisma.categoriaConsumo.findFirst({
      where: {
        servicioId: createCategoriaDto.servicioId,
        codigo: createCategoriaDto.codigo,
      },
    });

    if (existingCategoria) {
      throw new ConflictException(
        `Ya existe una categoría con el código '${createCategoriaDto.codigo}' para este servicio`,
      );
    }

    // Si se especifica número, verificar que no existe para este servicio
    if (createCategoriaDto.numero) {
      const existingNumero = await this.prisma.categoriaConsumo.findFirst({
        where: {
          servicioId: createCategoriaDto.servicioId,
          numero: createCategoriaDto.numero,
        },
      });

      if (existingNumero) {
        throw new ConflictException(
          `Ya existe una categoría con el número '${createCategoriaDto.numero}' para este servicio`,
        );
      }
    }

    // Crear la categoría
    return this.prisma.categoriaConsumo.create({
      data: {
        ...createCategoriaDto,
        cooperativaId,
        activo: createCategoriaDto.activo ?? true,
      },
      include: {
        servicio: {
          select: {
            id: true,
            nombre: true,
            codigo: true,
          },
        },
        historialPrecios: {
          orderBy: { vigenciaDesde: 'desc' },
          take: 1,
        },
        _count: {
          select: {
            historialPrecios: true,
            cuentasServicios: true,
          },
        },
      },
    });
  }

  async findAllByServicio(servicioId: string, cooperativaId: string, includeInactive = false) {
    // Verificar que el servicio existe
    const servicio = await this.prisma.servicioDisponible.findFirst({
      where: { id: servicioId, cooperativaId },
    });

    if (!servicio) {
      throw new NotFoundException(`Servicio con ID '${servicioId}' no encontrado`);
    }

    const where = {
      servicioId,
      cooperativaId,
      ...(includeInactive ? {} : { activo: true }),
    };

    return this.prisma.categoriaConsumo.findMany({
      where,
      include: {
        servicio: {
          select: {
            id: true,
            nombre: true,
            codigo: true,
          },
        },
        historialPrecios: {
          orderBy: { vigenciaDesde: 'desc' },
          take: 1,
        },
        _count: {
          select: {
            historialPrecios: true,
            cuentasServicios: true,
          },
        },
      },
      orderBy: [{ numero: 'asc' }, { nombre: 'asc' }],
    });
  }

  async findAll(cooperativaId: string, includeInactive = false) {
    const where = {
      cooperativaId,
      ...(includeInactive ? {} : { activo: true }),
    };

    return this.prisma.categoriaConsumo.findMany({
      where,
      include: {
        servicio: {
          select: {
            id: true,
            nombre: true,
            codigo: true,
          },
        },
        historialPrecios: {
          orderBy: { vigenciaDesde: 'desc' },
          take: 1,
        },
        _count: {
          select: {
            historialPrecios: true,
            cuentasServicios: true,
          },
        },
      },
      orderBy: [
        { servicio: { nombre: 'asc' } },
        { numero: 'asc' },
        { nombre: 'asc' },
      ],
    });
  }

  async findOne(id: string, cooperativaId: string) {
    const categoria = await this.prisma.categoriaConsumo.findFirst({
      where: { id, cooperativaId },
      include: {
        servicio: {
          select: {
            id: true,
            nombre: true,
            codigo: true,
            descripcion: true,
          },
        },
        historialPrecios: {
          orderBy: { vigenciaDesde: 'desc' },
        },
        _count: {
          select: {
            historialPrecios: true,
            cuentasServicios: true,
          },
        },
      },
    });

    if (!categoria) {
      throw new NotFoundException(`Categoría con ID '${id}' no encontrada`);
    }

    return categoria;
  }

  async update(
    id: string,
    updateCategoriaDto: UpdateCategoriaDto,
    cooperativaId: string,
  ) {
    // Verificar que la categoría existe
    const categoria = await this.prisma.categoriaConsumo.findFirst({
      where: { id, cooperativaId },
    });

    if (!categoria) {
      throw new NotFoundException(`Categoría con ID '${id}' no encontrada`);
    }

    // Si se especifica número, verificar que no existe para este servicio
    if (updateCategoriaDto.numero) {
      const existingNumero = await this.prisma.categoriaConsumo.findFirst({
        where: {
          servicioId: categoria.servicioId,
          numero: updateCategoriaDto.numero,
          id: { not: id },
        },
      });

      if (existingNumero) {
        throw new ConflictException(
          `Ya existe una categoría con el número '${updateCategoriaDto.numero}' para este servicio`,
        );
      }
    }

    return this.prisma.categoriaConsumo.update({
      where: { id },
      data: updateCategoriaDto,
      include: {
        servicio: {
          select: {
            id: true,
            nombre: true,
            codigo: true,
          },
        },
        historialPrecios: {
          orderBy: { vigenciaDesde: 'desc' },
          take: 1,
        },
        _count: {
          select: {
            historialPrecios: true,
            cuentasServicios: true,
          },
        },
      },
    });
  }

  async remove(id: string, cooperativaId: string) {
    // Verificar que la categoría existe
    const categoria = await this.prisma.categoriaConsumo.findFirst({
      where: { id, cooperativaId },
      include: {
        _count: {
          select: {
            cuentasServicios: true,
          },
        },
      },
    });

    if (!categoria) {
      throw new NotFoundException(`Categoría con ID '${id}' no encontrada`);
    }

    // Verificar que no tenga cuentas asociadas
    if (categoria._count.cuentasServicios > 0) {
      throw new BadRequestException(
        'No se puede eliminar la categoría porque tiene cuentas asociadas',
      );
    }

    // Eliminar la categoría (soft delete)
    return this.prisma.categoriaConsumo.update({
      where: { id },
      data: { activo: false },
    });
  }

  async findByCode(codigo: string, servicioId: string, cooperativaId: string) {
    return this.prisma.categoriaConsumo.findFirst({
      where: {
        codigo,
        servicioId,
        cooperativaId,
        activo: true,
      },
      include: {
        servicio: {
          select: {
            id: true,
            nombre: true,
            codigo: true,
          },
        },
        historialPrecios: {
          orderBy: { vigenciaDesde: 'desc' },
          take: 1,
        },
      },
    });
  }

  async getEstadisticasPorServicio(servicioId: string, cooperativaId: string) {
    const categorias = await this.prisma.categoriaConsumo.findMany({
      where: { servicioId, cooperativaId },
      include: {
        _count: {
          select: {
            historialPrecios: true,
            cuentasServicios: true,
          },
        },
      },
    });

    const totalCategorias = categorias.length;
    const categoriasActivas = categorias.filter((c) => c.activo).length;
    const totalHistorialPrecios = categorias.reduce(
      (sum, c) => sum + c._count.historialPrecios,
      0,
    );
    const totalCuentasServicios = categorias.reduce(
      (sum, c) => sum + c._count.cuentasServicios,
      0,
    );

    return {
      totalCategorias,
      categoriasActivas,
      categoriasInactivas: totalCategorias - categoriasActivas,
      totalHistorialPrecios,
      totalCuentasServicios,
      promedioHistorialPorCategoria:
        totalCategorias > 0 ? totalHistorialPrecios / totalCategorias : 0,
    };
  }
}