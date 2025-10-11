// ============================================
// SERVICIO PRINCIPAL DEL SISTEMA DE SUSCRIPCIONES
// ============================================

import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Logger } from '@nestjs/common';
import {
  ConfiguracionSuscripcionDto,
  ActualizarConfiguracionSuscripcionDto,
  SolicitudCambioComisionDto,
  ResponderSolicitudComisionDto,
  GenerarFacturaDto,
  AprobarFacturaDto,
  MarcarFacturaPagadaDto,
  FiltroFacturasDto,
  FiltroSolicitudesDto,
  RangoFechasDto,
} from '../dto/suscripciones.dto';
import {
  EstadoSolicitudComision,
  EstadoSuscripcionFactura,
  TipoPagoSuscripcion,
  EstadisticasSuscripcion,
  ResumenComisionesSuperAdmin,
  DatosFacturacionMensual,
} from '../interfaces/suscripciones.interface';

@Injectable()
export class SuscripcionesService {
  private readonly logger = new Logger(SuscripcionesService.name);

  constructor(private prisma: PrismaService) {}

  // ============================================
  // GESTIÓN DE CONFIGURACIÓN DE SUSCRIPCIÓN
  // ============================================

  /**
   * Crear configuración de suscripción para una cooperativa
   */
  async crearConfiguracionSuscripcion(
    cooperativaId: string,
    datos: ConfiguracionSuscripcionDto,
    superAdminId: string,
  ) {
    // Verificar que la cooperativa existe
    const cooperativa = await this.prisma.cooperativa.findUnique({
      where: { id: cooperativaId },
    });

    if (!cooperativa) {
      throw new NotFoundException('Cooperativa no encontrada');
    }

    // Verificar que no existe configuración previa
    const configuracionExistente = await this.prisma.configuracionSuscripcion.findUnique({
      where: { cooperativaId },
    });

    if (configuracionExistente) {
      throw new BadRequestException('La cooperativa ya tiene una configuración de suscripción');
    }

    // Calcular fecha de vencimiento inicial
    const fechaVencimiento = new Date();
    fechaVencimiento.setDate(datos.diaGeneracionFactura || 1);
    fechaVencimiento.setDate(fechaVencimiento.getDate() + (datos.diasVencimientoFactura || 30));

    // Crear configuración
    const configuracion = await this.prisma.configuracionSuscripcion.create({
      data: {
        cooperativaId,
        porcentajeComision: datos.porcentajeComision,
        comisionMinima: datos.comisionMinima || 0,
        comisionMaxima: datos.comisionMaxima,
        diaGeneracionFactura: datos.diaGeneracionFactura || 1,
        diasVencimientoFactura: datos.diasVencimientoFactura || 30,
        incluyeIVA: datos.incluyeIVA !== false,
        porcentajeIVA: datos.porcentajeIVA || 21,
        observaciones: datos.observaciones,
        modificadoPorSuperAdmin: superAdminId,
      },
      include: {
        cooperativa: {
          select: {
            id: true,
            nombre: true,
            razonSocial: true,
            cuit: true,
          },
        },
      },
    });

    this.logger.log(`Configuración de suscripción creada para cooperativa ${cooperativa.nombre}`);

    return configuracion;
  }

  /**
   * Obtener configuración de suscripción de una cooperativa
   */
  async obtenerConfiguracionSuscripcion(cooperativaId: string) {
    const configuracion = await this.prisma.configuracionSuscripcion.findUnique({
      where: { cooperativaId },
      include: {
        cooperativa: {
          select: {
            id: true,
            nombre: true,
            razonSocial: true,
            cuit: true,
          },
        },
        historialCambios: {
          orderBy: { fechaCambio: 'desc' },
          take: 10,
        },
        solicitudesComision: {
          orderBy: { fechaSolicitud: 'desc' },
          take: 5,
        },
        facturasSuscripcion: {
          orderBy: { fechaGeneracion: 'desc' },
          take: 12,
        },
      },
    });

    if (!configuracion) {
      throw new NotFoundException('Configuración de suscripción no encontrada');
    }

    return configuracion;
  }

  /**
   * Actualizar configuración de suscripción
   */
  async actualizarConfiguracionSuscripcion(
    cooperativaId: string,
    datos: ActualizarConfiguracionSuscripcionDto,
    superAdminId: string,
  ) {
    const configuracionActual = await this.prisma.configuracionSuscripcion.findUnique({
      where: { cooperativaId },
    });

    if (!configuracionActual) {
      throw new NotFoundException('Configuración de suscripción no encontrada');
    }

    // Iniciar transacción para actualizar configuración y crear historial
    const result = await this.prisma.$transaction(async (tx) => {
      // Registrar cambios en el historial
      const cambios: {
        configuracionId: string;
        campoModificado: string;
        valorAnterior: string;
        valorNuevo: string;
        motivo: string;
        realizadoPorSuperAdmin: string;
      }[] = [];
      
      if (datos.porcentajeComision !== undefined && Number(datos.porcentajeComision) !== Number(configuracionActual.porcentajeComision)) {
        cambios.push({
          configuracionId: configuracionActual.id,
          campoModificado: 'porcentajeComision',
          valorAnterior: configuracionActual.porcentajeComision.toString(),
          valorNuevo: datos.porcentajeComision.toString(),
          motivo: datos.motivoCambio || 'Actualización de configuración',
          realizadoPorSuperAdmin: superAdminId,
        });
      }

      if (datos.comisionMinima !== undefined && Number(datos.comisionMinima) !== Number(configuracionActual.comisionMinima)) {
        cambios.push({
          configuracionId: configuracionActual.id,
          campoModificado: 'comisionMinima',
          valorAnterior: configuracionActual.comisionMinima.toString(),
          valorNuevo: datos.comisionMinima.toString(),
          motivo: datos.motivoCambio || 'Actualización de configuración',
          realizadoPorSuperAdmin: superAdminId,
        });
      }

      // Crear registros de historial
      if (cambios.length > 0) {
        await tx.historialConfiguracionSuscripcion.createMany({
          data: cambios,
        });
      }

      // Actualizar configuración
      const configuracionActualizada = await tx.configuracionSuscripcion.update({
        where: { cooperativaId },
        data: {
          porcentajeComision: datos.porcentajeComision ?? configuracionActual.porcentajeComision,
          comisionMinima: datos.comisionMinima ?? configuracionActual.comisionMinima,
          comisionMaxima: datos.comisionMaxima ?? configuracionActual.comisionMaxima,
          diaGeneracionFactura: datos.diaGeneracionFactura ?? configuracionActual.diaGeneracionFactura,
          diasVencimientoFactura: datos.diasVencimientoFactura ?? configuracionActual.diasVencimientoFactura,
          incluyeIVA: datos.incluyeIVA ?? configuracionActual.incluyeIVA,
          porcentajeIVA: datos.porcentajeIVA ?? configuracionActual.porcentajeIVA,
          observaciones: datos.observaciones ?? configuracionActual.observaciones,
          fechaUltimModificacion: new Date(),
          modificadoPorSuperAdmin: superAdminId,
        },
        include: {
          cooperativa: {
            select: {
              id: true,
              nombre: true,
              razonSocial: true,
            },
          },
        },
      });

      return configuracionActualizada;
    });

    this.logger.log(`Configuración de suscripción actualizada para cooperativa ${cooperativaId}`);

    return result;
  }

  // ============================================
  // GESTIÓN DE SOLICITUDES DE CAMBIO DE COMISIÓN
  // ============================================

  /**
   * Crear solicitud de cambio de comisión (por parte de la cooperativa)
   */
  async crearSolicitudCambioComision(
    cooperativaId: string,
    datos: SolicitudCambioComisionDto,
  ) {
    const configuracion = await this.prisma.configuracionSuscripcion.findUnique({
      where: { cooperativaId },
    });

    if (!configuracion) {
      throw new NotFoundException('Configuración de suscripción no encontrada');
    }

    // Verificar que no hay una solicitud pendiente
    const solicitudPendiente = await this.prisma.solicitudCambioComision.findFirst({
      where: {
        configuracionId: configuracion.id,
        estado: EstadoSolicitudComision.PENDIENTE,
      },
    });

    if (solicitudPendiente) {
      throw new BadRequestException('Ya existe una solicitud de cambio de comisión pendiente');
    }

    // Crear solicitud
    const solicitud = await this.prisma.solicitudCambioComision.create({
      data: {
        configuracionId: configuracion.id,
        porcentajeComisionActual: configuracion.porcentajeComision,
        porcentajeComisionSolicitado: datos.porcentajeComisionSolicitado,
        motivo: datos.motivo,
        justificacion: datos.justificacion,
        documentosAdjuntos: datos.documentosAdjuntos || [],
        volumenMensualPromedio: datos.volumenMensualPromedio,
        cantidadPagosPromedio: datos.cantidadPagosPromedio,
        tiempoComoCiente: datos.tiempoComoCiente,
        proyeccionCrecimiento: datos.proyeccionCrecimiento,
      },
      include: {
        configuracion: {
          include: {
            cooperativa: {
              select: {
                id: true,
                nombre: true,
                razonSocial: true,
              },
            },
          },
        },
      },
    });

    this.logger.log(`Solicitud de cambio de comisión creada para cooperativa ${cooperativaId}`);

    return solicitud;
  }

  /**
   * Obtener solicitudes de cambio de comisión (con filtros)
   */
  async obtenerSolicitudesCambioComision(
    filtros: FiltroSolicitudesDto,
    cooperativaId?: string,
  ) {
    const where: any = {};

    if (cooperativaId) {
      where.configuracion = {
        cooperativaId,
      };
    }

    if (filtros.estado) {
      where.estado = filtros.estado;
    }

    const page = filtros.page || 1;
    const limit = filtros.limit || 10;
    const skip = (page - 1) * limit;

    const [solicitudes, total] = await Promise.all([
      this.prisma.solicitudCambioComision.findMany({
        where,
        include: {
          configuracion: {
            include: {
              cooperativa: {
                select: {
                  id: true,
                  nombre: true,
                  razonSocial: true,
                },
              },
            },
          },
        },
        orderBy: { fechaSolicitud: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.solicitudCambioComision.count({ where }),
    ]);

    return {
      solicitudes,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Responder a una solicitud de cambio de comisión (superadmin)
   */
  async responderSolicitudCambioComision(
    solicitudId: string,
    datos: ResponderSolicitudComisionDto,
    superAdminId: string,
  ) {
    const solicitud = await this.prisma.solicitudCambioComision.findUnique({
      where: { id: solicitudId },
      include: {
        configuracion: {
          include: {
            cooperativa: true,
          },
        },
      },
    });

    if (!solicitud) {
      throw new NotFoundException('Solicitud no encontrada');
    }

    if (solicitud.estado !== EstadoSolicitudComision.PENDIENTE) {
      throw new BadRequestException('La solicitud ya fue procesada');
    }

    // Actualizar solicitud
    const result = await this.prisma.$transaction(async (tx) => {
      const solicitudActualizada = await tx.solicitudCambioComision.update({
        where: { id: solicitudId },
        data: {
          estado: datos.estado,
          fechaRevision: new Date(),
          fechaResolucion: new Date(),
          respuestaSuperAdmin: datos.respuestaSuperAdmin,
          porcentajeComisionAprobado: datos.porcentajeComisionAprobado,
          fechaInicioNuevaComision: datos.fechaInicioNuevaComision ? new Date(datos.fechaInicioNuevaComision) : undefined,
          revisadoPorSuperAdmin: superAdminId,
          aprobadoPorSuperAdmin: superAdminId,
        },
        include: {
          configuracion: {
            include: {
              cooperativa: true,
            },
          },
        },
      });

      // Si se aprueba, actualizar la configuración de suscripción
      if (datos.estado === EstadoSolicitudComision.APROBADA && datos.porcentajeComisionAprobado) {
        await tx.configuracionSuscripcion.update({
          where: { id: solicitud.configuracionId },
          data: {
            porcentajeComision: datos.porcentajeComisionAprobado,
            fechaUltimModificacion: new Date(),
            modificadoPorSuperAdmin: superAdminId,
          },
        });

        // Registrar el cambio en el historial
        await tx.historialConfiguracionSuscripcion.create({
          data: {
            configuracionId: solicitud.configuracionId,
            campoModificado: 'porcentajeComision',
            valorAnterior: solicitud.porcentajeComisionActual.toString(),
            valorNuevo: datos.porcentajeComisionAprobado.toString(),
            motivo: `Solicitud aprobada: ${solicitud.motivo}`,
            realizadoPorSuperAdmin: superAdminId,
            aprobadoPorSuperAdmin: superAdminId,
          },
        });
      }

      return solicitudActualizada;
    });

    const accion = datos.estado === EstadoSolicitudComision.APROBADA ? 'aprobada' : 'rechazada';
    this.logger.log(`Solicitud de cambio de comisión ${accion} para cooperativa ${solicitud.configuracion.cooperativa.nombre}`);

    return result;
  }

  // ============================================
  // GESTIÓN DE FACTURAS DE SUSCRIPCIÓN
  // ============================================

  /**
   * Generar facturas de suscripción para un mes específico
   */
  async generarFacturasSuscripcion(datos: GenerarFacturaDto, superAdminId?: string) {
    const { mes, anio, forzarRegeneracion } = datos;

    this.logger.log(`Iniciando generación de facturas para ${mes}/${anio}`);

    // Obtener todas las configuraciones activas
    const configuraciones = await this.prisma.configuracionSuscripcion.findMany({
      where: { activa: true },
      include: {
        cooperativa: {
          select: {
            id: true,
            nombre: true,
            razonSocial: true,
          },
        },
      },
    });

    const resultados: {
      cooperativaId: string;
      cooperativaNombre: string;
      accion: string;
      motivo?: string;
      facturaId?: string;
      total?: number;
    }[] = [];

    for (const configuracion of configuraciones) {
      try {
        // Verificar si ya existe factura para este período
        const facturaExistente = await this.prisma.suscripcionFactura.findUnique({
          where: {
            configuracionId_mes_anio: {
              configuracionId: configuracion.id,
              mes,
              anio,
            },
          },
        });

        if (facturaExistente && !forzarRegeneracion) {
          resultados.push({
            cooperativaId: configuracion.cooperativaId,
            cooperativaNombre: configuracion.cooperativa.nombre,
            accion: 'omitida',
            motivo: 'Ya existe factura para este período',
            facturaId: facturaExistente.id,
          });
          continue;
        }

        // Obtener datos de facturación del mes
        const datosFacturacion = await this.obtenerDatosFacturacionMensual(
          configuracion.cooperativaId,
          mes,
          anio,
        );

        if (datosFacturacion.cantidadPagos === 0) {
          resultados.push({
            cooperativaId: configuracion.cooperativaId,
            cooperativaNombre: configuracion.cooperativa.nombre,
            accion: 'omitida',
            motivo: 'No hay pagos en el período',
          });
          continue;
        }

        // Calcular fechas
        const fechaGeneracion = new Date();
        const fechaVencimiento = new Date(anio, mes - 1, configuracion.diaGeneracionFactura);
        fechaVencimiento.setDate(fechaVencimiento.getDate() + configuracion.diasVencimientoFactura);

        const periodo = `${mes.toString().padStart(2, '0')}/${anio}`;

        // Crear o actualizar factura
        let factura;
        if (facturaExistente && forzarRegeneracion) {
          factura = await this.prisma.suscripcionFactura.update({
            where: { id: facturaExistente.id },
            data: {
              fechaGeneracion,
              fechaVencimiento,
              cantidadPagos: datosFacturacion.cantidadPagos,
              montoTotalPagos: datosFacturacion.montoTotalPagos,
              porcentajeComision: datosFacturacion.porcentajeComision,
              subtotalComision: datosFacturacion.subtotalComision,
              montoIVA: datosFacturacion.montoIVA,
              totalFactura: datosFacturacion.totalFactura,
              estado: EstadoSuscripcionFactura.GENERADA,
            },
          });
          
          resultados.push({
            cooperativaId: configuracion.cooperativaId,
            cooperativaNombre: configuracion.cooperativa.nombre,
            accion: 'regenerada',
            facturaId: factura.id,
            total: datosFacturacion.totalFactura,
          });
        } else {
          factura = await this.prisma.suscripcionFactura.create({
            data: {
              configuracionId: configuracion.id,
              mes,
              anio,
              periodo,
              fechaGeneracion,
              fechaVencimiento,
              cantidadPagos: datosFacturacion.cantidadPagos,
              montoTotalPagos: datosFacturacion.montoTotalPagos,
              porcentajeComision: datosFacturacion.porcentajeComision,
              subtotalComision: datosFacturacion.subtotalComision,
              montoIVA: datosFacturacion.montoIVA,
              totalFactura: datosFacturacion.totalFactura,
            },
          });

          resultados.push({
            cooperativaId: configuracion.cooperativaId,
            cooperativaNombre: configuracion.cooperativa.nombre,
            accion: 'generada',
            facturaId: factura.id,
            total: datosFacturacion.totalFactura,
          });
        }

      } catch (error) {
        this.logger.error(`Error generando factura para ${configuracion.cooperativa.nombre}:`, error);
        resultados.push({
          cooperativaId: configuracion.cooperativaId,
          cooperativaNombre: configuracion.cooperativa.nombre,
          accion: 'error',
          motivo: error.message,
        });
      }
    }

    this.logger.log(`Generación de facturas completada. Procesadas: ${resultados.length}`);

    return {
      periodo: `${mes}/${anio}`,
      totalProcesadas: resultados.length,
      generadas: resultados.filter(r => r.accion === 'generada').length,
      regeneradas: resultados.filter(r => r.accion === 'regenerada').length,
      omitidas: resultados.filter(r => r.accion === 'omitida').length,
      errores: resultados.filter(r => r.accion === 'error').length,
      detalles: resultados,
    };
  }

  /**
   * Obtener datos de facturación mensual para una cooperativa
   */
  async obtenerDatosFacturacionMensual(
    cooperativaId: string,
    mes: number,
    anio: number,
  ): Promise<DatosFacturacionMensual> {
    // Calcular fechas del período
    const fechaInicio = new Date(anio, mes - 1, 1);
    const fechaFin = new Date(anio, mes, 0, 23, 59, 59, 999);

    // Obtener configuración de suscripción
    const configuracion = await this.prisma.configuracionSuscripcion.findUnique({
      where: { cooperativaId },
    });

    if (!configuracion) {
      throw new NotFoundException('Configuración de suscripción no encontrada');
    }

    // Obtener pagos del mes
    const pagos = await this.prisma.pago.findMany({
      where: {
        factura: {
          cuenta: {
            cooperativaId,
          },
        },
        fechaPago: {
          gte: fechaInicio,
          lte: fechaFin,
        },
      },
      select: {
        id: true,
        monto: true,
        fechaPago: true,
        facturaId: true,
        proveedorPagoId: true,
        comisionProveedor: true,
      },
    });

    // Calcular totales
    const cantidadPagos = pagos.length;
    const montoTotalPagos = pagos.reduce((sum, pago) => sum + pago.monto.toNumber(), 0);

    // Calcular comisión
    const porcentajeComision = configuracion.porcentajeComision.toNumber();
    let subtotalComision = montoTotalPagos * (porcentajeComision / 100);

    // Aplicar comisión mínima y máxima
    if (configuracion.comisionMinima && subtotalComision < configuracion.comisionMinima.toNumber()) {
      subtotalComision = configuracion.comisionMinima.toNumber();
    }
    if (configuracion.comisionMaxima && subtotalComision > configuracion.comisionMaxima.toNumber()) {
      subtotalComision = configuracion.comisionMaxima.toNumber();
    }

    // Calcular IVA
    let montoIVA = 0;
    if (configuracion.incluyeIVA) {
      montoIVA = subtotalComision * (configuracion.porcentajeIVA.toNumber() / 100);
    }

    const totalFactura = subtotalComision + montoIVA;

    return {
      cooperativaId,
      mes,
      anio,
      pagos: pagos.map(pago => ({
        id: pago.id,
        monto: Number(pago.monto) / 100, // Convertir de centavos a pesos
        fechaPago: pago.fechaPago,
        facturaId: pago.facturaId || undefined,
        proveedorPagoId: pago.proveedorPagoId || undefined,
        comisionProveedor: pago.comisionProveedor ? Number(pago.comisionProveedor) / 100 : undefined,
      })),
      cantidadPagos,
      montoTotalPagos,
      porcentajeComision,
      subtotalComision,
      montoIVA,
      totalFactura,
    };
  }

  /**
   * Tarea automática para generar facturas mensualmente
   */
  @Cron('0 0 1 * *') // El día 1 de cada mes a las 00:00
  async generarFacturasMensualesAutomatico() {
    const fechaActual = new Date();
    const mesAnterior = fechaActual.getMonth(); // 0-11 (mes anterior)
    const anio = mesAnterior === 0 ? fechaActual.getFullYear() - 1 : fechaActual.getFullYear();
    const mes = mesAnterior === 0 ? 12 : mesAnterior + 1;

    this.logger.log(`Iniciando generación automática de facturas para ${mes}/${anio}`);

    try {
      const resultado = await this.generarFacturasSuscripcion({ mes, anio });
      this.logger.log(`Generación automática completada: ${resultado.generadas} facturas generadas`);
    } catch (error) {
      this.logger.error('Error en generación automática de facturas:', error);
    }
  }

  // ============================================
  // CONTINUARÁ EN LA SIGUIENTE PARTE...
  // ============================================
}