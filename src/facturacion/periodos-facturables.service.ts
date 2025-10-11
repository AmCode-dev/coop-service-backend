import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';

import {
  CreatePeriodoFacturableDto,
  UpdatePeriodoFacturableDto,
  CreateConceptoFacturableAplicadoDto,
  UpdateConceptoFacturableAplicadoDto,
  PeriodoFacturableQueryDto,
  ConceptoAplicadoQueryDto,
  BulkCreateConceptosAplicadosDto,
  CalcularFacturacionDto,
} from './dto/periodo-facturable.dto';
import {
  PeriodoFacturable,
  ConceptoFacturableAplicado,
  EstadoPeriodo,
} from '../../generated/prisma';
import { Decimal } from '@prisma/client/runtime/library';
import { PrismaService } from 'src/prisma';

@Injectable()
export class PeriodosFacturablesService {
  constructor(private prisma: PrismaService) {}

  async create(
    dto: CreatePeriodoFacturableDto,
    cooperativaId: string,
    usuarioId: string,
  ): Promise<PeriodoFacturable> {
    // Verificar que no existe un período para el mismo mes/año
    const existente = await this.prisma.periodoFacturable.findUnique({
      where: {
        cooperativaId_mes_anio: {
          cooperativaId,
          mes: dto.mes,
          anio: dto.anio,
        },
      },
    });

    if (existente) {
      throw new ConflictException(
        `Ya existe un período para ${dto.mes}/${dto.anio}`,
      );
    }

    // Generar el período como string
    const periodo = `${dto.mes.toString().padStart(2, '0')}/${dto.anio}`;

    return this.prisma.periodoFacturable.create({
      data: {
        ...dto,
        periodo,
        cooperativaId,
        creadoPorId: usuarioId,
        estado: EstadoPeriodo.ABIERTO,
      },
      include: {
        creadoPor: {
          select: {
            id: true,
            nombre: true,
          },
        },
        _count: {
          select: {
            conceptosAplicados: true,
          },
        },
      },
    });
  }

  async findAll(
    cooperativaId: string,
    query: PeriodoFacturableQueryDto,
  ): Promise<PeriodoFacturable[]> {
    const where: { [key: string]: any } = {
      cooperativaId,
    };

    if (query.mes) {
      where.mes = query.mes;
    }

    if (query.anio) {
      where.anio = query.anio;
    }

    if (query.estado) {
      where.estado = query.estado;
    }

    return this.prisma.periodoFacturable.findMany({
      where,
      include: {
        creadoPor: {
          select: {
            id: true,
            nombre: true,
          },
        },
        cerradoPor: {
          select: {
            id: true,
            nombre: true,
          },
        },
        _count: {
          select: {
            conceptosAplicados: true,
          },
        },
      },
      orderBy: [{ anio: 'desc' }, { mes: 'desc' }],
    });
  }

  async findOne(id: string, cooperativaId: string): Promise<PeriodoFacturable> {
    const periodo = await this.prisma.periodoFacturable.findFirst({
      where: {
        id,
        cooperativaId,
      },
      include: {
        creadoPor: {
          select: {
            id: true,
            nombre: true,
          },
        },
        cerradoPor: {
          select: {
            id: true,
            nombre: true,
          },
        },
        conceptosAplicados: {
          include: {
            concepto: true,
            cuenta: {
              select: {
                id: true,
                numeroCuenta: true,
                titularServicio: {
                  select: {
                    id: true,
                    nombreCompleto: true,
                  },
                },
              },
            },
            cuentaServicio: {
              select: {
                id: true,
                servicio: {
                  select: {
                    id: true,
                    nombre: true,
                  },
                },
                categoria: {
                  select: {
                    id: true,
                    nombre: true,
                  },
                },
              },
            },
          },
          orderBy: [
            { cuenta: { numeroCuenta: 'asc' } },
            { concepto: { nombre: 'asc' } },
          ],
        },
      },
    });

    if (!periodo) {
      throw new NotFoundException('Período facturable no encontrado');
    }

    return periodo;
  }

  async update(
    id: string,
    dto: UpdatePeriodoFacturableDto,
    cooperativaId: string,
    usuarioId?: string,
  ): Promise<PeriodoFacturable> {
    const periodo = await this.findOne(id, cooperativaId);
    console.log({ usuarioId });
    // Si se está cerrando el período
    if (
      dto.estado === EstadoPeriodo.CERRADO &&
      periodo.estado !== EstadoPeriodo.CERRADO
    ) {
      dto.fechaCierre = new Date();
    }

    return this.prisma.periodoFacturable.update({
      where: { id },
      data: dto,
      include: {
        creadoPor: {
          select: {
            id: true,
            nombre: true,
          },
        },
        cerradoPor: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });
  }

  async remove(id: string, cooperativaId: string): Promise<void> {
    const periodo = await this.findOne(id, cooperativaId);
    console.log(periodo);
    // Verificar que no tenga conceptos aplicados
    const conceptosAplicados =
      await this.prisma.conceptoFacturableAplicado.count({
        where: { periodoId: id },
      });
    if (conceptosAplicados > 0) {
      throw new BadRequestException(
        'No se puede eliminar el período porque tiene conceptos aplicados',
      );
    }

    await this.prisma.periodoFacturable.update({
      where: { id },
      data: { estado: EstadoPeriodo.CERRADO },
    });
  }

  // GESTIÓN DE CONCEPTOS APLICADOS
  async createConceptoAplicado(
    dto: CreateConceptoFacturableAplicadoDto,
    cooperativaId: string,
    usuarioId: string,
  ): Promise<ConceptoFacturableAplicado> {
    // Verificar que el período existe y está abierto
    const periodo = await this.findOne(dto.periodoId, cooperativaId);

    if (periodo.estado !== EstadoPeriodo.ABIERTO) {
      throw new BadRequestException(
        'El período no está abierto para modificaciones',
      );
    }

    // Verificar que no existe ya un concepto aplicado para esta combinación
    const existente = await this.prisma.conceptoFacturableAplicado.findUnique({
      where: {
        periodoId_conceptoId_cuentaId: {
          periodoId: dto.periodoId,
          conceptoId: dto.conceptoId,
          cuentaId: dto.cuentaId,
        },
      },
    });

    if (existente) {
      throw new ConflictException(
        'Ya existe este concepto aplicado para esta cuenta en este período',
      );
    }

    // Obtener el concepto para validar IVA
    const concepto = await this.prisma.conceptoFacturable.findUnique({
      where: { id: dto.conceptoId },
    });

    if (!concepto) {
      throw new NotFoundException('Concepto facturable no encontrado');
    }

    // Calcular montos
    const cantidad = new Decimal(dto.cantidad);
    const valorUnitario = new Decimal(dto.valorUnitario);
    const subtotal = cantidad.mul(valorUnitario);

    let montoIVA = new Decimal(0);
    let total = subtotal;

    const aplicaIVA = dto.aplicaIVA ?? concepto.aplicaIVA;

    if (aplicaIVA) {
      const porcentajeIVA = dto.porcentajeIVA
        ? new Decimal(dto.porcentajeIVA)
        : concepto.porcentajeIVA;
      if (porcentajeIVA) {
        montoIVA = subtotal.mul(porcentajeIVA).div(100);
        total = subtotal.add(montoIVA);
      }
    }

    return this.prisma.conceptoFacturableAplicado.create({
      data: {
        cantidad: dto.cantidad,
        valorUnitario: dto.valorUnitario,
        subtotal: subtotal.toString(),
        aplicaIVA,
        porcentajeIVA: aplicaIVA
          ? dto.porcentajeIVA || concepto.porcentajeIVA?.toString()
          : null,
        montoIVA: montoIVA.toString(),
        total: total.toString(),
        observaciones: dto.observaciones,
        periodoId: dto.periodoId,
        conceptoId: dto.conceptoId,
        cuentaId: dto.cuentaId,
        cuentaServicioId: dto.cuentaServicioId,
        creadoPorId: usuarioId,
        facturado: false,
      },
      include: {
        concepto: {
          select: {
            id: true,
            nombre: true,
            codigo: true,
            tipoConcepto: true,
            tipoCalculo: true,
          },
        },
        cuenta: {
          select: {
            id: true,
            numeroCuenta: true,
            titularServicio: {
              select: {
                id: true,
                nombreCompleto: true,
              },
            },
          },
        },
        cuentaServicio: {
          select: {
            id: true,
            servicio: {
              select: {
                id: true,
                nombre: true,
              },
            },
          },
        },
      },
    });
  }

  async findConceptosAplicados(
    cooperativaId: string,
    query: ConceptoAplicadoQueryDto,
  ): Promise<ConceptoFacturableAplicado[]> {
    const where: Record<string, any> = {
      periodo: {
        cooperativaId,
      },
    };

    if (query.periodoId) {
      where.periodoId = query.periodoId;
    }

    if (query.conceptoId) {
      where.conceptoId = query.conceptoId;
    }

    if (query.cuentaId) {
      where.cuentaId = query.cuentaId;
    }

    if (!query.includeFacturados) {
      where.facturado = false;
    }

    return this.prisma.conceptoFacturableAplicado.findMany({
      where,
      include: {
        periodo: {
          select: {
            id: true,
            periodo: true,
            mes: true,
            anio: true,
          },
        },
        concepto: {
          select: {
            id: true,
            nombre: true,
            codigo: true,
            tipoConcepto: true,
          },
        },
        cuenta: {
          select: {
            id: true,
            numeroCuenta: true,
            titularServicio: {
              select: {
                id: true,
                nombreCompleto: true,
              },
            },
          },
        },
      },
      orderBy: [
        { periodo: { anio: 'desc' } },
        { periodo: { mes: 'desc' } },
        { cuenta: { numeroCuenta: 'asc' } },
      ],
    });
  }

  async updateConceptoAplicado(
    id: string,
    dto: UpdateConceptoFacturableAplicadoDto,
    cooperativaId: string,
  ): Promise<ConceptoFacturableAplicado> {
    const conceptoAplicado =
      await this.prisma.conceptoFacturableAplicado.findFirst({
        where: {
          id,
          periodo: {
            cooperativaId,
          },
        },
        include: {
          periodo: true,
          concepto: true,
        },
      });

    if (!conceptoAplicado) {
      throw new NotFoundException('Concepto aplicado no encontrado');
    }

    if (conceptoAplicado.periodo.estado !== EstadoPeriodo.ABIERTO) {
      throw new BadRequestException(
        'El período no está abierto para modificaciones',
      );
    }

    if (conceptoAplicado.facturado) {
      throw new BadRequestException(
        'No se puede modificar un concepto que ya fue facturado',
      );
    }

    // Recalcular si cambian cantidad o valor unitario
    let updateData: Record<string, any> = { ...dto };

    if (dto.cantidad || dto.valorUnitario) {
      const cantidad = new Decimal(dto.cantidad || conceptoAplicado.cantidad);
      const valorUnitario = new Decimal(
        dto.valorUnitario || conceptoAplicado.valorUnitario,
      );
      const subtotal = cantidad.mul(valorUnitario);

      let montoIVA = new Decimal(0);
      let total = subtotal;

      const aplicaIVA = dto.aplicaIVA ?? conceptoAplicado.aplicaIVA;

      if (aplicaIVA) {
        const porcentajeIVA = dto.porcentajeIVA
          ? new Decimal(dto.porcentajeIVA)
          : conceptoAplicado.porcentajeIVA
            ? new Decimal(conceptoAplicado.porcentajeIVA)
            : new Decimal(0);

        if (porcentajeIVA.gt(0)) {
          montoIVA = subtotal.mul(porcentajeIVA).div(100);
          total = subtotal.add(montoIVA);
        }
      }

      updateData = {
        ...updateData,
        subtotal: subtotal.toString(),
        montoIVA: montoIVA.toString(),
        total: total.toString(),
      };
    }

    return this.prisma.conceptoFacturableAplicado.update({
      where: { id },
      data: updateData,
      include: {
        concepto: {
          select: {
            id: true,
            nombre: true,
            codigo: true,
          },
        },
        cuenta: {
          select: {
            id: true,
            numeroCuenta: true,
          },
        },
      },
    });
  }

  async removeConceptoAplicado(
    id: string,
    cooperativaId: string,
  ): Promise<void> {
    const conceptoAplicado =
      await this.prisma.conceptoFacturableAplicado.findFirst({
        where: {
          id,
          periodo: {
            cooperativaId,
          },
        },
        include: {
          periodo: true,
        },
      });

    if (!conceptoAplicado) {
      throw new NotFoundException('Concepto aplicado no encontrado');
    }

    if (conceptoAplicado.periodo.estado !== EstadoPeriodo.ABIERTO) {
      throw new BadRequestException(
        'El período no está abierto para modificaciones',
      );
    }

    if (conceptoAplicado.facturado) {
      throw new BadRequestException(
        'No se puede eliminar un concepto que ya fue facturado',
      );
    }

    await this.prisma.conceptoFacturableAplicado.delete({
      where: { id },
    });
  }

  // OPERACIONES MASIVAS
  async bulkCreateConceptosAplicados(
    dto: BulkCreateConceptosAplicadosDto,
    cooperativaId: string,
    usuarioId: string,
  ): Promise<ConceptoFacturableAplicado[]> {
    const periodo = await this.findOne(dto.periodoId, cooperativaId);

    if (periodo.estado !== EstadoPeriodo.ABIERTO) {
      throw new BadRequestException(
        'El período no está abierto para modificaciones',
      );
    }

    const concepto = await this.prisma.conceptoFacturable.findFirst({
      where: {
        id: dto.conceptoId,
        cooperativaId,
      },
    });

    if (!concepto) {
      throw new NotFoundException('Concepto facturable no encontrado');
    }

    const resultados: ConceptoFacturableAplicado[] = [];

    for (const cuentaConcepto of dto.cuentasConceptos) {
      try {
        const conceptoAplicado = await this.createConceptoAplicado(
          {
            ...dto,
            ...cuentaConcepto,
          },
          cooperativaId,
          usuarioId,
        );
        resultados.push(conceptoAplicado);
      } catch (error) {
        // Log del error pero continúa con las demás cuentas
        console.error(
          `Error aplicando concepto a cuenta ${cuentaConcepto.cuentaId}:`,
          error,
        );
      }
    }

    return resultados;
  }

  // ANÁLISIS Y REPORTES
  async calcularResumenFacturacion(
    dto: CalcularFacturacionDto,
    cooperativaId: string,
  ) {
    const where: Record<string, any> = {
      periodoId: dto.periodoId,
      periodo: {
        cooperativaId,
      },
    };

    if (dto.cuentaId) {
      where.cuentaId = dto.cuentaId;
    }

    const conceptosAplicados =
      await this.prisma.conceptoFacturableAplicado.findMany({
        where,
        include: {
          concepto: {
            select: {
              id: true,
              nombre: true,
              tipoConcepto: true,
            },
          },
          cuenta: {
            select: {
              id: true,
              numeroCuenta: true,
            },
          },
        },
      });

    const resumen = {
      totalConceptos: conceptosAplicados.length,
      subtotal: new Decimal(0),
      totalIVA: new Decimal(0),
      total: new Decimal(0),
      conceptosPorTipo: {} as Record<
        string,
        { cantidad: number; subtotal: Decimal; total: Decimal }
      >,
      cuentas: {} as Record<
        string,
        {
          numeroCuenta: string;
          subtotal: Decimal;
          totalIVA: Decimal;
          total: Decimal;
        }
      >,
    };

    for (const concepto of conceptosAplicados) {
      const subtotal = new Decimal(concepto.subtotal);
      const montoIVA = new Decimal(concepto.montoIVA);
      const total = new Decimal(concepto.total);

      resumen.subtotal = resumen.subtotal.add(subtotal);
      resumen.totalIVA = resumen.totalIVA.add(montoIVA);
      resumen.total = resumen.total.add(total);

      // Por tipo de concepto
      const tipo = 'FIJO' as string;
      if (!resumen.conceptosPorTipo[tipo]) {
        resumen.conceptosPorTipo[tipo] = {
          cantidad: 0,
          subtotal: new Decimal(0),
          total: new Decimal(0),
        };
      }
      resumen.conceptosPorTipo[tipo].cantidad++;
      resumen.conceptosPorTipo[tipo].subtotal =
        resumen.conceptosPorTipo[tipo].subtotal.add(subtotal);
      resumen.conceptosPorTipo[tipo].total =
        resumen.conceptosPorTipo[tipo].total.add(total);

      // Por cuenta
      const cuentaId = concepto.cuentaId;
      if (!resumen.cuentas[cuentaId]) {
        resumen.cuentas[cuentaId] = {
          numeroCuenta: concepto.cuentaId || '',
          subtotal: new Decimal(0),
          totalIVA: new Decimal(0),
          total: new Decimal(0),
        };
      }
      resumen.cuentas[cuentaId].subtotal =
        resumen.cuentas[cuentaId].subtotal.add(subtotal);
      resumen.cuentas[cuentaId].totalIVA =
        resumen.cuentas[cuentaId].totalIVA.add(montoIVA);
      resumen.cuentas[cuentaId].total =
        resumen.cuentas[cuentaId].total.add(total);
    }

    return {
      ...resumen,
      subtotal: resumen.subtotal.toString(),
      totalIVA: resumen.totalIVA.toString(),
      total: resumen.total.toString(),
      conceptosPorTipo: Object.entries(resumen.conceptosPorTipo).reduce(
        (acc, [tipo, datos]) => {
          acc[tipo] = {
            ...datos,
            subtotal: datos.subtotal.toString(),
            total: datos.total.toString(),
          };
          return acc;
        },
        {} as Record<string, any>,
      ),
      cuentas: Object.entries(resumen.cuentas).reduce(
        (acc, [cuentaId, datos]) => {
          acc[cuentaId] = {
            ...datos,
            subtotal: datos.subtotal.toString(),
            totalIVA: datos.totalIVA.toString(),
            total: datos.total.toString(),
          };
          return acc;
        },
        {} as Record<string, any>,
      ),
    };
  }
}
