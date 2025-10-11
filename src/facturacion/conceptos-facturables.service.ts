import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateConceptoFacturableDto,
  UpdateConceptoFacturableDto,
  CreateHistorialConceptoDto,
  UpdateHistorialConceptoDto,
  ConceptoFacturableQueryDto,
} from './dto/concepto-facturable.dto';
import { ConceptoFacturable, HistorialConcepto } from '../../generated/prisma';

@Injectable()
export class ConceptosFacturablesService {
  constructor(private prisma: PrismaService) {}

  async create(
    dto: CreateConceptoFacturableDto,
    cooperativaId: string,
    usuarioId: string,
  ): Promise<ConceptoFacturable> {
    // Verificar que no existe un concepto con el mismo código
    const existente = await this.prisma.conceptoFacturable.findUnique({
      where: {
        cooperativaId_codigo: {
          cooperativaId,
          codigo: dto.codigo,
        },
      },
    });

    if (existente) {
      throw new ConflictException(
        `Ya existe un concepto con el código '${dto.codigo}'`,
      );
    }

    // Crear el concepto
    const concepto = await this.prisma.conceptoFacturable.create({
      data: {
        ...dto,
        cooperativaId,
      },
      include: {
        historial: {
          orderBy: { vigenciaDesde: 'desc' },
          take: 1,
        },
      },
    });

    // Si tiene valor actual, crear el primer registro en historial
    if (dto.valorActual) {
      await this.prisma.historialConcepto.create({
        data: {
          valor: dto.valorActual,
          vigenciaDesde: new Date(),
          observaciones: 'Valor inicial del concepto',
          motivo: 'Creación del concepto',
          activo: true,
          conceptoId: concepto.id,
          creadoPorId: usuarioId,
        },
      });
    }

    return concepto;
  }

  async findAll(
    cooperativaId: string,
    query: ConceptoFacturableQueryDto,
  ): Promise<ConceptoFacturable[]> {
    const where: Record<string, any> = {
      cooperativaId,
    };

    if (!query.includeInactive) {
      where.activo = true;
    }

    if (query.tipoConcepto) {
      where.tipoConcepto = query.tipoConcepto;
    }

    if (query.tipoCalculo) {
      where.tipoCalculo = query.tipoCalculo;
    }

    if (query.search) {
      where.OR = [
        { nombre: { contains: query.search, mode: 'insensitive' } },
        { descripcion: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.conceptoFacturable.findMany({
      where,
      include: {
        historial: {
          orderBy: { vigenciaDesde: 'desc' },
          take: 1,
        },
        _count: {
          select: {
            conceptosAplicados: true,
            itemsFactura: true,
          },
        },
      },
      orderBy: [{ tipoConcepto: 'asc' }, { nombre: 'asc' }],
    });
  }

  async findOne(
    id: string,
    cooperativaId: string,
  ): Promise<ConceptoFacturable> {
    const concepto = await this.prisma.conceptoFacturable.findFirst({
      where: {
        id,
        cooperativaId,
      },
      include: {
        historial: {
          orderBy: { vigenciaDesde: 'desc' },
        },
        conceptosAplicados: {
          include: {
            periodo: true,
            cuenta: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            conceptosAplicados: true,
            itemsFactura: true,
          },
        },
      },
    });

    if (!concepto) {
      throw new NotFoundException('Concepto facturable no encontrado');
    }

    return concepto;
  }

  async findByCodigo(
    codigo: string,
    cooperativaId: string,
  ): Promise<ConceptoFacturable> {
    const concepto = await this.prisma.conceptoFacturable.findUnique({
      where: {
        cooperativaId_codigo: {
          cooperativaId,
          codigo,
        },
      },
      include: {
        historial: {
          orderBy: { vigenciaDesde: 'desc' },
          take: 1,
        },
      },
    });

    if (!concepto) {
      throw new NotFoundException(
        `Concepto con código '${codigo}' no encontrado`,
      );
    }

    return concepto;
  }

  async update(
    id: string,
    dto: UpdateConceptoFacturableDto,
    cooperativaId: string,
  ): Promise<ConceptoFacturable> {
    const concepto = await this.findOne(id, cooperativaId);
    console.log({ concepto });
    return this.prisma.conceptoFacturable.update({
      where: { id },
      data: dto,
      include: {
        historial: {
          orderBy: { vigenciaDesde: 'desc' },
          take: 3,
        },
      },
    });
  }

  async remove(id: string, cooperativaId: string): Promise<void> {
    const concepto = await this.findOne(id, cooperativaId);
    console.log({ concepto });
    // Verificar que no tenga conceptos aplicados
    const conceptosAplicados =
      await this.prisma.conceptoFacturableAplicado.count({
        where: { conceptoId: id },
      });

    if (conceptosAplicados > 0) {
      throw new BadRequestException(
        'No se puede eliminar el concepto porque tiene registros aplicados en períodos facturables',
      );
    }

    // Soft delete
    await this.prisma.conceptoFacturable.update({
      where: { id },
      data: { activo: false },
    });
  }

  // GESTIÓN DE HISTORIAL
  async createHistorial(
    dto: CreateHistorialConceptoDto,
    cooperativaId: string,
    usuarioId: string,
  ): Promise<HistorialConcepto> {
    // Verificar que el concepto existe y pertenece a la cooperativa
    await this.findOne(dto.conceptoId, cooperativaId);

    // Verificar que no haya solapamiento de fechas
    const solapamiento = await this.prisma.historialConcepto.findFirst({
      where: {
        conceptoId: dto.conceptoId,
        activo: true,
        OR: [
          {
            AND: [
              { vigenciaDesde: { lte: dto.vigenciaDesde } },
              {
                OR: [
                  { vigenciaHasta: null },
                  { vigenciaHasta: { gte: dto.vigenciaDesde } },
                ],
              },
            ],
          },
          dto.vigenciaHasta
            ? {
                AND: [
                  { vigenciaDesde: { lte: dto.vigenciaHasta } },
                  {
                    OR: [
                      { vigenciaHasta: null },
                      { vigenciaHasta: { gte: dto.vigenciaHasta } },
                    ],
                  },
                ],
              }
            : {},
        ],
      },
    });

    if (solapamiento) {
      throw new ConflictException(
        'Las fechas se solapan con un registro existente',
      );
    }

    const historial = await this.prisma.historialConcepto.create({
      data: {
        ...dto,
        creadoPorId: usuarioId,
        activo: true,
      },
      include: {
        concepto: true,
        creadoPor: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });

    // Actualizar el valor actual del concepto
    await this.prisma.conceptoFacturable.update({
      where: { id: dto.conceptoId },
      data: { valorActual: dto.valor },
    });

    return historial;
  }

  async getHistorial(
    conceptoId: string,
    cooperativaId: string,
  ): Promise<HistorialConcepto[]> {
    // Verificar que el concepto existe
    await this.findOne(conceptoId, cooperativaId);

    return this.prisma.historialConcepto.findMany({
      where: {
        conceptoId,
        activo: true,
      },
      include: {
        creadoPor: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
      orderBy: { vigenciaDesde: 'desc' },
    });
  }

  async updateHistorial(
    historialId: string,
    dto: UpdateHistorialConceptoDto,
    cooperativaId: string,
  ): Promise<HistorialConcepto> {
    const historial = await this.prisma.historialConcepto.findFirst({
      where: {
        id: historialId,
        concepto: {
          cooperativaId,
        },
      },
    });

    if (!historial) {
      throw new NotFoundException('Registro de historial no encontrado');
    }

    return this.prisma.historialConcepto.update({
      where: { id: historialId },
      data: dto,
      include: {
        concepto: true,
        creadoPor: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });
  }

  async deleteHistorial(
    historialId: string,
    cooperativaId: string,
  ): Promise<void> {
    const historial = await this.prisma.historialConcepto.findFirst({
      where: {
        id: historialId,
        concepto: {
          cooperativaId,
        },
      },
    });

    if (!historial) {
      throw new NotFoundException('Registro de historial no encontrado');
    }

    // Soft delete
    await this.prisma.historialConcepto.update({
      where: { id: historialId },
      data: { activo: false },
    });
  }

  // ESTADÍSTICAS
  async getEstadisticas(cooperativaId: string) {
    const [
      totalConceptos,
      conceptosActivos,
      conceptosInactivos,
      totalAplicados,
      conceptosPorTipo,
      conceptosPorCalculo,
    ] = await Promise.all([
      this.prisma.conceptoFacturable.count({
        where: { cooperativaId },
      }),
      this.prisma.conceptoFacturable.count({
        where: { cooperativaId, activo: true },
      }),
      this.prisma.conceptoFacturable.count({
        where: { cooperativaId, activo: false },
      }),
      this.prisma.conceptoFacturableAplicado.count({
        where: {
          concepto: { cooperativaId },
        },
      }),
      this.prisma.conceptoFacturable.groupBy({
        by: ['tipoConcepto'],
        where: { cooperativaId, activo: true },
        _count: { id: true },
      }),
      this.prisma.conceptoFacturable.groupBy({
        by: ['tipoCalculo'],
        where: { cooperativaId, activo: true },
        _count: { id: true },
      }),
    ]);

    return {
      totalConceptos,
      conceptosActivos,
      conceptosInactivos,
      totalAplicados,
      conceptosPorTipo,
      conceptosPorCalculo,
    };
  }

  async getValorVigente(
    conceptoId: string,
    fecha: Date,
    cooperativaId: string,
  ): Promise<string | null> {
    // Verificar que el concepto existe
    await this.findOne(conceptoId, cooperativaId);

    const historial = await this.prisma.historialConcepto.findFirst({
      where: {
        conceptoId,
        activo: true,
        vigenciaDesde: { lte: fecha },
        OR: [{ vigenciaHasta: null }, { vigenciaHasta: { gte: fecha } }],
      },
      orderBy: { vigenciaDesde: 'desc' },
    });

    return historial?.valor?.toString() || null;
  }
}
