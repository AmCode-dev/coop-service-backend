import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateHistorialPrecioDto,
  UpdateHistorialPrecioDto,
  BuscarPreciosDto,
} from './dto/historial-precio.dto';

@Injectable()
export class HistorialPreciosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createHistorialPrecioDto: CreateHistorialPrecioDto,
    cooperativaId: string,
    usuarioId: string,
  ) {
    // Verificar que la categoría existe y pertenece a la cooperativa
    const categoria = await this.prisma.categoriaConsumo.findFirst({
      where: {
        id: createHistorialPrecioDto.categoriaId,
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
      },
    });

    if (!categoria) {
      throw new NotFoundException(
        `Categoría con ID '${createHistorialPrecioDto.categoriaId}' no encontrada`,
      );
    }

    // Verificar que no existe un precio para el mismo mes/año
    const existingPrecio = await this.prisma.historialPrecioCategoria.findFirst({
      where: {
        categoriaId: createHistorialPrecioDto.categoriaId,
        mes: createHistorialPrecioDto.mes,
        anio: createHistorialPrecioDto.anio,
      },
    });

    if (existingPrecio) {
      throw new ConflictException(
        `Ya existe un precio para el mes ${createHistorialPrecioDto.mes}/${createHistorialPrecioDto.anio}`,
      );
    }

    // Validar fechas
    const vigenciaDesde = new Date(createHistorialPrecioDto.vigenciaDesde);
    const vigenciaHasta = createHistorialPrecioDto.vigenciaHasta
      ? new Date(createHistorialPrecioDto.vigenciaHasta)
      : null;

    if (vigenciaHasta && vigenciaHasta <= vigenciaDesde) {
      throw new BadRequestException(
        'La fecha de fin de vigencia debe ser posterior a la fecha de inicio',
      );
    }

    // Crear el historial de precio
    return this.prisma.historialPrecioCategoria.create({
      data: {
        precioBase: createHistorialPrecioDto.precioBase,
        mes: createHistorialPrecioDto.mes,
        anio: createHistorialPrecioDto.anio,
        vigenciaDesde,
        vigenciaHasta,
        observaciones: createHistorialPrecioDto.observaciones,
        categoriaId: createHistorialPrecioDto.categoriaId,
        creadoPorId: usuarioId,
      },
      include: {
        categoria: {
          include: {
            servicio: {
              select: {
                id: true,
                nombre: true,
                codigo: true,
              },
            },
          },
        },
      },
    });
  }

  async findAllByCategoria(
    categoriaId: string,
    cooperativaId: string,
    buscarPreciosDto?: BuscarPreciosDto,
  ) {
    // Verificar que la categoría existe
    const categoria = await this.prisma.categoriaConsumo.findFirst({
      where: { id: categoriaId, cooperativaId },
    });

    if (!categoria) {
      throw new NotFoundException(`Categoría con ID '${categoriaId}' no encontrada`);
    }

    const where: any = {
      categoriaId,
    };

    // Aplicar filtros si se proporcionan
    if (buscarPreciosDto) {
      if (buscarPreciosDto.mes) {
        where.mes = buscarPreciosDto.mes;
      }
      if (buscarPreciosDto.anio) {
        where.anio = buscarPreciosDto.anio;
      }
      if (buscarPreciosDto.fechaDesde || buscarPreciosDto.fechaHasta) {
        where.vigenciaDesde = {};
        if (buscarPreciosDto.fechaDesde) {
          where.vigenciaDesde.gte = new Date(buscarPreciosDto.fechaDesde);
        }
        if (buscarPreciosDto.fechaHasta) {
          where.vigenciaDesde.lte = new Date(buscarPreciosDto.fechaHasta);
        }
      }
    }

    return this.prisma.historialPrecioCategoria.findMany({
      where,
      include: {
        categoria: {
          include: {
            servicio: {
              select: {
                id: true,
                nombre: true,
                codigo: true,
              },
            },
          },
        },
      },
      orderBy: { vigenciaDesde: 'desc' },
    });
  }

  async findPrecioVigente(categoriaId: string, cooperativaId: string, fecha?: Date) {
    // Verificar que la categoría existe
    const categoria = await this.prisma.categoriaConsumo.findFirst({
      where: { id: categoriaId, cooperativaId },
    });

    if (!categoria) {
      throw new NotFoundException(`Categoría con ID '${categoriaId}' no encontrada`);
    }

    const fechaConsulta = fecha || new Date();

    return this.prisma.historialPrecioCategoria.findFirst({
      where: {
        categoriaId,
        vigenciaDesde: { lte: fechaConsulta },
        OR: [{ vigenciaHasta: null }, { vigenciaHasta: { gte: fechaConsulta } }],
      },
      include: {
        categoria: {
          include: {
            servicio: {
              select: {
                id: true,
                nombre: true,
                codigo: true,
              },
            },
          },
        },
      },
      orderBy: { vigenciaDesde: 'desc' },
    });
  }

  async findUltimoPrecio(categoriaId: string, cooperativaId: string) {
    // Verificar que la categoría existe
    const categoria = await this.prisma.categoriaConsumo.findFirst({
      where: { id: categoriaId, cooperativaId },
    });

    if (!categoria) {
      throw new NotFoundException(`Categoría con ID '${categoriaId}' no encontrada`);
    }

    return this.prisma.historialPrecioCategoria.findFirst({
      where: {
        categoriaId,
      },
      include: {
        categoria: {
          include: {
            servicio: {
              select: {
                id: true,
                nombre: true,
                codigo: true,
              },
            },
          },
        },
      },
      orderBy: { vigenciaDesde: 'desc' },
    });
  }

  async update(
    id: string,
    updateHistorialPrecioDto: UpdateHistorialPrecioDto,
    cooperativaId: string,
  ) {
    // Verificar que el historial de precio existe
    const historialPrecio = await this.prisma.historialPrecioCategoria.findFirst({
      where: {
        id,
        categoria: { cooperativaId },
      },
    });

    if (!historialPrecio) {
      throw new NotFoundException(`Historial de precio con ID '${id}' no encontrado`);
    }

    // Validar fechas si se actualizan
    if (updateHistorialPrecioDto.vigenciaHasta) {
      const vigenciaHasta = new Date(updateHistorialPrecioDto.vigenciaHasta);
      if (vigenciaHasta <= historialPrecio.vigenciaDesde) {
        throw new BadRequestException(
          'La fecha de fin de vigencia debe ser posterior a la fecha de inicio',
        );
      }
    }

    return this.prisma.historialPrecioCategoria.update({
      where: { id },
      data: {
        ...updateHistorialPrecioDto,
        ...(updateHistorialPrecioDto.vigenciaHasta && {
          vigenciaHasta: new Date(updateHistorialPrecioDto.vigenciaHasta),
        }),
      },
      include: {
        categoria: {
          include: {
            servicio: {
              select: {
                id: true,
                nombre: true,
                codigo: true,
              },
            },
          },
        },
      },
    });
  }

  async remove(id: string, cooperativaId: string) {
    // Verificar que el historial de precio existe
    const historialPrecio = await this.prisma.historialPrecioCategoria.findFirst({
      where: {
        id,
        categoria: { cooperativaId },
      },
    });

    if (!historialPrecio) {
      throw new NotFoundException(`Historial de precio con ID '${id}' no encontrado`);
    }

    // Eliminar el historial de precio
    return this.prisma.historialPrecioCategoria.delete({
      where: { id },
    });
  }

  async getEvolucionPrecios(categoriaId: string, cooperativaId: string) {
    // Verificar que la categoría existe
    const categoria = await this.prisma.categoriaConsumo.findFirst({
      where: { id: categoriaId, cooperativaId },
    });

    if (!categoria) {
      throw new NotFoundException(`Categoría con ID '${categoriaId}' no encontrada`);
    }

    const precios = await this.prisma.historialPrecioCategoria.findMany({
      where: {
        categoriaId,
      },
      select: {
        id: true,
        precioBase: true,
        mes: true,
        anio: true,
        vigenciaDesde: true,
        vigenciaHasta: true,
        createdAt: true,
      },
      orderBy: { vigenciaDesde: 'asc' },
    });

    // Calcular variaciones
    const evolucion = precios.map((precio, index) => {
      const anterior = index > 0 ? precios[index - 1] : null;
      const variacionAbsoluta = anterior
        ? Number(precio.precioBase) - Number(anterior.precioBase)
        : 0;
      const variacionPorcentual = anterior
        ? ((Number(precio.precioBase) - Number(anterior.precioBase)) /
            Number(anterior.precioBase)) *
          100
        : 0;

      return {
        ...precio,
        variacionAbsoluta,
        variacionPorcentual: Number(variacionPorcentual.toFixed(2)),
      };
    });

    return {
      categoria: {
        id: categoria.id,
        nombre: categoria.nombre,
        codigo: categoria.codigo,
      },
      totalRegistros: evolucion.length,
      precioActual: evolucion[evolucion.length - 1]?.precioBase || null,
      precioInicial: evolucion[0]?.precioBase || null,
      variacionTotal:
        evolucion.length > 1
          ? Number(evolucion[evolucion.length - 1].precioBase) - Number(evolucion[0].precioBase)
          : 0,
      evolucion,
    };
  }

  async getComparacionPrecios(cooperativaId: string, fecha?: Date) {
    const fechaConsulta = fecha || new Date();

    // Obtener todas las categorías activas
    const categorias = await this.prisma.categoriaConsumo.findMany({
      where: {
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
      },
      orderBy: [
        { servicio: { nombre: 'asc' } },
        { numero: 'asc' },
        { nombre: 'asc' },
      ],
    });

    // Para cada categoría, buscar el precio vigente
    const resultado = await Promise.all(
      categorias.map(async (categoria) => {
        const precioVigente = await this.prisma.historialPrecioCategoria.findFirst({
          where: {
            categoriaId: categoria.id,
            vigenciaDesde: { lte: fechaConsulta },
            OR: [{ vigenciaHasta: null }, { vigenciaHasta: { gte: fechaConsulta } }],
          },
          orderBy: { vigenciaDesde: 'desc' },
        });

        return {
          categoria: {
            id: categoria.id,
            nombre: categoria.nombre,
            codigo: categoria.codigo,
            numero: categoria.numero,
          },
          servicio: categoria.servicio,
          precioVigente: precioVigente || null,
          tienePrecio: !!precioVigente,
        };
      }),
    );

    return resultado;
  }
}