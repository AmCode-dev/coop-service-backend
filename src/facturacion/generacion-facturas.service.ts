import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  GenerarFacturasPeriodoDto,
  GenerarFacturaIndividualDto,
  ResumenGeneracionFacturasDto,
  ResultadoGeneracionFacturas,
  PreviewFactura,
} from './dto/generar-facturas.dto';
import { EstadoPeriodo, EstadoFactura, Factura } from '../../generated/prisma';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class GeneracionFacturasService {
  constructor(private prisma: PrismaService) {}

  async generarFacturasPeriodo(
    dto: GenerarFacturasPeriodoDto,
    cooperativaId: string,
    usuarioId: string,
  ): Promise<ResultadoGeneracionFacturas> {
    // Verificar que el período existe y está cerrado
    const periodo = await this.prisma.periodoFacturable.findFirst({
      where: {
        id: dto.periodoId,
        cooperativaId,
      },
    });

    if (!periodo) {
      throw new NotFoundException('Período facturable no encontrado');
    }

    if (periodo.estado !== EstadoPeriodo.CERRADO) {
      throw new BadRequestException(
        'El período debe estar cerrado para generar facturas',
      );
    }

    // Obtener conceptos aplicados agrupados por cuenta
    const conceptosAplicados =
      await this.prisma.conceptoFacturableAplicado.findMany({
        where: {
          periodoId: dto.periodoId,
          ...(dto.cuentasEspecificas
            ? { cuentaId: { in: dto.cuentasEspecificas } }
            : {}),
        },
        include: {
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
        orderBy: [
          { cuenta: { numeroCuenta: 'asc' } },
          { concepto: { nombre: 'asc' } },
        ],
      });

    // Agrupar por cuenta
    const conceptosPorCuenta = conceptosAplicados.reduce(
      (acc, concepto) => {
        const cuentaId = concepto.cuentaId;
        if (!acc[cuentaId]) {
          acc[cuentaId] = [];
        }
        acc[cuentaId].push(concepto);
        return acc;
      },
      {} as Record<string, typeof conceptosAplicados>,
    );

    const resultado: ResultadoGeneracionFacturas = {
      periodoId: dto.periodoId,
      periodo: periodo.periodo,
      totalCuentas: Object.keys(conceptosPorCuenta).length,
      facturasGeneradas: 0,
      facturasActualizadas: 0,
      errores: 0,
      facturasCreadas: [],
      erroresDetalle: [],
    };

    // Generar facturas para cada cuenta
    for (const [cuentaId, conceptos] of Object.entries(conceptosPorCuenta)) {
      try {
        const factura = await this.generarFacturaIndividual(
          {
            periodoId: dto.periodoId,
            cuentaId,
            fechaVencimiento: dto.fechaVencimiento,
            observaciones: dto.observaciones,
            sobreescribirExistente: dto.sobreescribirExistentes,
          },
          cooperativaId,
          usuarioId,
        );

        if (factura.nuevaFactura) {
          resultado.facturasGeneradas++;
        } else {
          resultado.facturasActualizadas++;
        }

        // FIXME: When we need to create the detailed list of created invoices
        // resultado.facturasCreadas.push({
        //   facturaId: factura.factura.id,
        //   numeroFactura: factura.factura.numeroFactura,
        //   cuentaId: factura.factura.cuentaId,
        //   numeroCuenta: conceptos[0]?.cuentaId || '',
        //   titularServicio: factura.factura.titularServicio.nombreCompleto ?? '',
        //   total: factura.factura.total.toString() ?? '',
        //   totalConceptos: conceptos.length,
        // });
      } catch (error) {
        resultado.errores++;
        resultado.erroresDetalle.push({
          cuentaId,
          numeroCuenta: conceptos[0]?.cuentaId || '',
          error: error instanceof Error ? error.message : 'Error desconocido',
        });
      }
    }

    // Actualizar estado del período a FACTURADO si todas las facturas se generaron
    if (resultado.errores === 0 && !dto.cuentasEspecificas) {
      await this.prisma.periodoFacturable.update({
        where: { id: dto.periodoId },
        data: { estado: EstadoPeriodo.FACTURADO },
      });
    }

    return resultado;
  }

  async generarFacturaIndividual(
    dto: GenerarFacturaIndividualDto,
    cooperativaId: string,
    usuarioId: string,
  ): Promise<{ factura: any; nuevaFactura: boolean }> {
    // Verificar que el período existe
    console.log({ usuarioId });
    const periodo = await this.prisma.periodoFacturable.findFirst({
      where: {
        id: dto.periodoId,
        cooperativaId,
      },
    });

    if (!periodo) {
      throw new NotFoundException('Período facturable no encontrado');
    }

    // Verificar que la cuenta existe y pertenece a la cooperativa
    const cuenta = await this.prisma.cuenta.findFirst({
      where: {
        id: dto.cuentaId,
        cooperativaId,
      },
      include: {
        titularServicio: {
          select: {
            id: true,
            nombreCompleto: true,
          },
        },
        servicios: {
          where: { activo: true },
          take: 1, // Tomamos el primer servicio activo como principal
        },
      },
    });

    if (!cuenta) {
      throw new NotFoundException('Cuenta no encontrada');
    }

    // Obtener conceptos aplicados para esta cuenta en este período
    const conceptosAplicados =
      await this.prisma.conceptoFacturableAplicado.findMany({
        where: {
          periodoId: dto.periodoId,
          cuentaId: dto.cuentaId,
        },
        include: {
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
          { concepto: { tipoConcepto: 'asc' } },
          { concepto: { nombre: 'asc' } },
        ],
      });

    if (conceptosAplicados.length === 0) {
      throw new BadRequestException(
        'No hay conceptos aplicados para esta cuenta en este período',
      );
    }

    // Calcular totales
    let subtotal = new Decimal(0);
    let totalIVA = new Decimal(0);

    for (const concepto of conceptosAplicados) {
      subtotal = subtotal.add(new Decimal(concepto.subtotal));
      totalIVA = totalIVA.add(new Decimal(concepto.montoIVA));
    }

    const total = subtotal.add(totalIVA);

    // Verificar si ya existe una factura para este período y cuenta
    const facturaExistente = await this.prisma.factura.findFirst({
      where: {
        cuentaId: dto.cuentaId,
        mes: periodo.mes,
        anio: periodo.anio,
      },
    });

    let factura: Factura | null = null;
    let nuevaFactura = true;

    if (facturaExistente && !dto.sobreescribirExistente) {
      throw new ConflictException(
        `Ya existe una factura para esta cuenta en el período ${periodo.periodo}`,
      );
    }

    if (facturaExistente && dto.sobreescribirExistente) {
      // Actualizar factura existente
      factura = await this.prisma.factura.update({
        where: { id: facturaExistente.id },
        data: {
          fechaVencimiento: new Date(dto.fechaVencimiento),
          subtotal: subtotal.toString(),
          totalIVA: totalIVA.toString(),
          total: total.toString(),
          saldoPendiente: total.toString(),
          observaciones: dto.observaciones,
          updatedAt: new Date(),
        },
      });
      nuevaFactura = false;

      // Eliminar items anteriores
      await this.prisma.itemFactura.deleteMany({
        where: { facturaId: factura.id },
      });
    } else {
      // Generar número de factura único
      const ultimaFactura = await this.prisma.factura.findFirst({
        where: {
          cuenta: { cooperativaId },
          anio: periodo.anio,
        },
        orderBy: { numeroFactura: 'desc' },
      });

      const ultimoNumero = ultimaFactura
        ? parseInt(ultimaFactura.numeroFactura.split('-').pop() || '0')
        : 0;

      const nuevoNumero = (ultimoNumero + 1).toString().padStart(6, '0');
      const numeroFactura = `FAC-${periodo.anio}-${periodo.mes.toString().padStart(2, '0')}-${nuevoNumero}`;

      // Crear nueva factura
      factura = await this.prisma.factura.create({
        data: {
          numeroFactura,
          mes: periodo.mes,
          anio: periodo.anio,
          periodo: periodo.periodo,
          fechaVencimiento: new Date(dto.fechaVencimiento),
          subtotal: subtotal.toString(),
          totalIVA: totalIVA.toString(),
          total: total.toString(),
          saldoPendiente: total.toString(),
          estado: EstadoFactura.PENDIENTE,
          observaciones: dto.observaciones,
          cuentaId: dto.cuentaId,
          cuentaServicioId: '',
        },
      });
    }

    // Crear items de factura desde conceptos aplicados
    const itemsData = conceptosAplicados.map((concepto, index) => ({
      descripcion: this.generarDescripcionItem(concepto),
      cantidad: concepto.cantidad.toString(),
      precioUnitario: concepto.valorUnitario.toString(),
      subtotal: concepto.subtotal.toString(),
      aplicaIVA: concepto.aplicaIVA,
      montoIVA: concepto.montoIVA.toString(),
      total: concepto.total.toString(),
      orden: index + 1,
      facturaId: factura.id,
      conceptoId: concepto.conceptoId,
    }));

    await this.prisma.itemFactura.createMany({
      data: itemsData,
    });

    // Marcar conceptos como facturados
    await this.prisma.conceptoFacturableAplicado.updateMany({
      where: {
        periodoId: dto.periodoId,
        cuentaId: dto.cuentaId,
      },
      data: {
        facturado: true,
      },
    });

    return { factura, nuevaFactura };
  }

  async previewFacturas(
    dto: ResumenGeneracionFacturasDto,
    cooperativaId: string,
  ): Promise<PreviewFactura[]> {
    // Obtener conceptos aplicados agrupados por cuenta
    const conceptosAplicados =
      await this.prisma.conceptoFacturableAplicado.findMany({
        where: {
          periodoId: dto.periodoId,
          periodo: { cooperativaId },
          ...(dto.cuentasEspecificas
            ? { cuentaId: { in: dto.cuentasEspecificas } }
            : {}),
        },
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
          { cuenta: { numeroCuenta: 'asc' } },
          { concepto: { nombre: 'asc' } },
        ],
      });

    // Agrupar por cuenta
    const conceptosPorCuenta = conceptosAplicados.reduce(
      (acc, concepto) => {
        const cuentaId = concepto.cuentaId;
        if (!acc[cuentaId]) {
          acc[cuentaId] = [];
        }
        acc[cuentaId].push(concepto);
        return acc;
      },
      {} as Record<string, typeof conceptosAplicados>,
    );

    // Generar preview para cada cuenta
    const previews: PreviewFactura[] = [];

    for (const [cuentaId, conceptos] of Object.entries(conceptosPorCuenta)) {
      let subtotal = new Decimal(0);
      let totalIVA = new Decimal(0);

      const conceptosFormateados = conceptos.map((concepto) => {
        subtotal = subtotal.add(new Decimal(concepto.subtotal));
        totalIVA = totalIVA.add(new Decimal(concepto.montoIVA));

        return {
          conceptoId: concepto.conceptoId,
          nombreConcepto: concepto.conceptoId || '',
          cantidad: concepto.cantidad.toString(),
          valorUnitario: concepto.valorUnitario.toString(),
          subtotal: concepto.subtotal.toString(),
          aplicaIVA: concepto.aplicaIVA,
          montoIVA: concepto.montoIVA.toString(),
          total: concepto.total.toString(),
        };
      });

      const total = subtotal.add(totalIVA);

      previews.push({
        cuentaId,
        numeroCuenta: conceptos[0]?.cuentaId || '',
        titularServicio: { nombre: '', apellido: '' },
        conceptosAplicados: conceptosFormateados,
        resumenFactura: {
          subtotal: subtotal.toString(),
          totalIVA: totalIVA.toString(),
          total: total.toString(),
          totalConceptos: conceptos.length,
        },
      });
    }

    return previews.sort((a, b) =>
      a.numeroCuenta.localeCompare(b.numeroCuenta),
    );
  }

  private generarDescripcionItem(concepto: Record<string, any>): string {
    const cantidad = parseFloat(concepto.cantidad);
    const cantidadFormateada =
      cantidad % 1 === 0 ? cantidad.toString() : cantidad.toFixed(2);

    if (cantidad === 1) {
      // FIXME: El tipo de concepto no es fijo
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return concepto.conceptoId || '';
    }

    return `${concepto.conceptoId || ''} - ${cantidadFormateada} unid.`;
  }

  async eliminarFacturasPeriodo(
    periodoId: string,
    cooperativaId: string,
    usuarioId: string,
  ): Promise<{ facturasEliminadas: number; conceptosLiberados: number }> {
    // Verificar que el período existe
    console.log({ usuarioId });
    const periodo = await this.prisma.periodoFacturable.findFirst({
      where: {
        id: periodoId,
        cooperativaId,
      },
    });

    if (!periodo) {
      throw new NotFoundException('Período facturable no encontrado');
    }

    // Obtener facturas del período
    const facturas = await this.prisma.factura.findMany({
      where: {
        mes: periodo.mes,
        anio: periodo.anio,
        cuenta: { cooperativaId },
      },
      include: {
        pagos: true,
      },
    });

    // Verificar que ninguna factura tenga pagos
    const facturasConPagos = facturas.filter((f) => f.pagos.length > 0);
    if (facturasConPagos.length > 0) {
      throw new BadRequestException(
        `No se pueden eliminar las facturas porque ${facturasConPagos.length} facturas tienen pagos registrados`,
      );
    }

    // Eliminar facturas e items
    for (const factura of facturas) {
      await this.prisma.itemFactura.deleteMany({
        where: { facturaId: factura.id },
      });
    }

    const facturasEliminadas = await this.prisma.factura.deleteMany({
      where: {
        mes: periodo.mes,
        anio: periodo.anio,
        cuenta: { cooperativaId },
      },
    });

    // Liberar conceptos aplicados (marcar como no facturados)
    const conceptosLiberados =
      await this.prisma.conceptoFacturableAplicado.updateMany({
        where: {
          periodoId,
          facturado: true,
        },
        data: {
          facturado: false,
        },
      });

    // Actualizar estado del período a CERRADO
    await this.prisma.periodoFacturable.update({
      where: { id: periodoId },
      data: { estado: EstadoPeriodo.CERRADO },
    });

    return {
      facturasEliminadas: facturasEliminadas.count,
      conceptosLiberados: conceptosLiberados.count,
    };
  }
}
