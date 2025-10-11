import {
  Controller,
  Get,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { SocioOnly } from '../../auth/decorators/auth.decorators';
import {
  GetUser,
  GetCooperativaId,
} from '../../auth/decorators/user.decorators';
import type { AuthenticatedUser } from '../../auth/interfaces/auth.interface';
import { PersonasService } from '../personas.service';

@Controller('socios-consumo')
@UseGuards(JwtAuthGuard)
@SocioOnly()
export class ConsumoSocioSimpleController {
  constructor(private readonly personasService: PersonasService) {}

  // ============================================
  // ENDPOINT BÁSICO - MIS MEDIDORES
  // ============================================

  @Get('mis-medidores')
  @HttpCode(HttpStatus.OK)
  async obtenerMisMedidores(
    @GetUser() user: AuthenticatedUser,
    @GetCooperativaId() cooperativaId: string,
  ): Promise<{
    success: boolean;
    message: string;
    medidores: Array<{
      id: string;
      numeroMedidor: string;
      servicio: string;
      activo: boolean;
      ultimaLectura?: {
        fecha: Date;
        valor: number;
        consumo?: number;
      };
    }>;
  }> {
    try {
      // Buscar la relación usuario-cooperativa-persona
      const usuarioCooperativa = await this.personasService['prisma'].usuarioCooperativa.findFirst({
        where: { 
          usuarioId: user.id, 
          cooperativaId,
          activo: true,
        },
        include: { 
          usuario: true,
          persona: true,
        },
      });

      if (!usuarioCooperativa?.persona) {
        return {
          success: false,
          message: 'No tienes una persona vinculada para consultar medidores',
          medidores: [],
        };
      }

      // Obtener medidores asociados a las cuentas del socio
      const medidores = await this.personasService['prisma'].medidor.findMany({
        where: {
          cuentasServicios: {
            some: {
              cuenta: {
                titularServicioId: usuarioCooperativa.persona.id,
                cooperativaId,
              },
            },
          },
        },
        include: {
          cuentasServicios: {
            where: {
              cuenta: {
                titularServicioId: usuarioCooperativa.persona.id,
              },
            },
            include: {
              servicio: {
                select: {
                  nombre: true,
                  codigo: true,
                },
              },
            },
          },
          lecturas: {
            orderBy: {
              fechaLectura: 'desc',
            },
            take: 1,
          },
        },
      });

      const medidoresFormateados = medidores.map((medidor) => {
        const servicio = medidor.cuentasServicios[0]?.servicio;
        const ultimaLectura = medidor.lecturas[0];

        return {
          id: medidor.id,
          numeroMedidor: medidor.numeroMedidor,
          servicio: servicio ? `${servicio.nombre} (${servicio.codigo})` : 'Sin servicio',
          activo: medidor.activo,
          ...(ultimaLectura && {
            ultimaLectura: {
              fecha: ultimaLectura.fechaLectura,
              valor: Number(ultimaLectura.valorLectura),
              consumo: ultimaLectura.consumoCalculado
                ? Number(ultimaLectura.consumoCalculado)
                : undefined,
            },
          }),
        };
      });

      return {
        success: true,
        message: `Se encontraron ${medidoresFormateados.length} medidores`,
        medidores: medidoresFormateados,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al obtener medidores: ' + (error as Error).message,
        medidores: [],
      };
    }
  }

  // ============================================
  // ENDPOINT BÁSICO - HISTORIAL DE LECTURAS
  // ============================================

  @Get('historial-lecturas')
  @HttpCode(HttpStatus.OK)
  async obtenerHistorialLecturas(
    @GetUser() user: AuthenticatedUser,
    @GetCooperativaId() cooperativaId: string,
    @Query('medidorId') medidorId?: string,
    @Query('mes') mes?: string,
    @Query('anio') anio?: string,
    @Query('limite') limite: string = '20',
  ): Promise<{
    success: boolean;
    message: string;
    lecturas: Array<{
      id: string;
      fecha: Date;
      valor: number;
      consumo?: number;
      periodo: string;
      medidor: {
        numeroMedidor: string;
        servicio: string;
      };
      anomalia: boolean;
    }>;
    total: number;
  }> {
    try {
      // Buscar la persona vinculada al usuario
      const usuarioCooperativa = await this.personasService['prisma'].usuarioCooperativa.findFirst({
        where: { 
          usuarioId: user.id, 
          cooperativaId,
          activo: true,
        },
        include: { 
          usuario: true,
          persona: true,
        },
      });

      if (!usuarioCooperativa?.persona) {
        return {
          success: false,
          message: 'No tienes una persona vinculada',
          lecturas: [],
          total: 0,
        };
      }

      // Construir filtros
      const whereClause: Record<string, any> = {
        medidor: {
          cuentasServicios: {
            some: {
              cuenta: {
                titularServicioId: usuarioCooperativa.persona.id,
                cooperativaId,
              },
            },
          },
        },
      };

      if (medidorId) {
        whereClause.medidorId = medidorId;
      }

      if (mes && anio) {
        whereClause.mes = parseInt(mes, 10);
        whereClause.anio = parseInt(anio, 10);
      }

      const limiteNum = parseInt(limite, 10);

      const [lecturas, total] = await Promise.all([
        this.personasService['prisma'].lectura.findMany({
          where: whereClause,
          include: {
            medidor: {
              include: {
                cuentasServicios: {
                  where: {
                    cuenta: {
                      titularServicioId: usuarioCooperativa.persona.id,
                    },
                  },
                  include: {
                    servicio: {
                      select: {
                        nombre: true,
                        codigo: true,
                      },
                    },
                  },
                },
              },
            },
          },
          orderBy: {
            fechaLectura: 'desc',
          },
          take: limiteNum,
        }),
        this.personasService['prisma'].lectura.count({
          where: whereClause,
        }),
      ]);

      const lecturasFormateadas = lecturas.map((lectura) => {
        const servicio = lectura.medidor.cuentasServicios[0]?.servicio;
        const meses = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

        return {
          id: lectura.id,
          fecha: lectura.fechaLectura,
          valor: Number(lectura.valorLectura),
          consumo: lectura.consumoCalculado ? Number(lectura.consumoCalculado) : undefined,
          periodo: `${meses[lectura.mes - 1]}/${lectura.anio}`,
          medidor: {
            numeroMedidor: lectura.medidor.numeroMedidor,
            servicio: servicio ? `${servicio.nombre} (${servicio.codigo})` : 'Sin servicio',
          },
          anomalia: lectura.anomalia || false,
        };
      });

      return {
        success: true,
        message: `Se encontraron ${lecturasFormateadas.length} lecturas`,
        lecturas: lecturasFormateadas,
        total,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al obtener historial: ' + (error as Error).message,
        lecturas: [],
        total: 0,
      };
    }
  }

  // ============================================
  // ENDPOINT BÁSICO - RESUMEN DE CONSUMO
  // ============================================

  @Get('resumen-consumo')
  @HttpCode(HttpStatus.OK)
  async obtenerResumenConsumo(
    @GetUser() user: AuthenticatedUser,
    @GetCooperativaId() cooperativaId: string,
  ): Promise<{
    success: boolean;
    message: string;
    resumen: {
      totalMedidores: number;
      medidoresActivos: number;
      ultimoMes: {
        periodo: string;
        consumoTotal: number;
        lecturas: number;
      };
      alertas: {
        sinLecturasRecientes: number;
        conAnomalias: number;
      };
    };
  }> {
    try {
      // Buscar la persona vinculada al usuario
      const usuarioCooperativa = await this.personasService['prisma'].usuarioCooperativa.findFirst({
        where: { 
          usuarioId: user.id, 
          cooperativaId,
          activo: true,
        },
        include: { 
          usuario: true,
          persona: true,
        },
      });

      if (!usuarioCooperativa?.persona) {
        return {
          success: false,
          message: 'No tienes una persona vinculada',
          resumen: {
            totalMedidores: 0,
            medidoresActivos: 0,
            ultimoMes: { periodo: 'Sin datos', consumoTotal: 0, lecturas: 0 },
            alertas: { sinLecturasRecientes: 0, conAnomalias: 0 },
          },
        };
      }

      // Obtener estadísticas básicas
      const [
        totalMedidores,
        medidoresActivos,
        lecturasUltimoMes,
        lecturasConAnomalias,
        medidoresSinLecturasRecientes,
      ] = await Promise.all([
        this.personasService['prisma'].medidor.count({
          where: {
            cuentasServicios: {
              some: {
                cuenta: {
                  titularServicioId: usuarioCooperativa.persona.id,
                  cooperativaId,
                },
              },
            },
          },
        }),
        this.personasService['prisma'].medidor.count({
          where: {
            activo: true,
            cuentasServicios: {
              some: {
                cuenta: {
                  titularServicioId: usuarioCooperativa.persona.id,
                  cooperativaId,
                },
              },
            },
          },
        }),
        this.personasService['prisma'].lectura.findMany({
          where: {
            medidor: {
              cuentasServicios: {
                some: {
                  cuenta: {
                    titularServicioId: usuarioCooperativa.persona.id,
                    cooperativaId,
                  },
                },
              },
            },
            mes: new Date().getMonth() + 1,
            anio: new Date().getFullYear(),
          },
          select: {
            consumoCalculado: true,
          },
        }),
        this.personasService['prisma'].lectura.count({
          where: {
            medidor: {
              cuentasServicios: {
                some: {
                  cuenta: {
                    titularServicioId: usuarioCooperativa.persona.id,
                    cooperativaId,
                  },
                },
              },
            },
            anomalia: true,
            fechaLectura: {
              gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // Últimos 90 días
            },
          },
        }),
        this.personasService['prisma'].medidor.count({
          where: {
            cuentasServicios: {
              some: {
                cuenta: {
                  titularServicioId: usuarioCooperativa.persona.id,
                  cooperativaId,
                },
              },
            },
            lecturas: {
              none: {
                fechaLectura: {
                  gte: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // Sin lecturas en 45 días
                },
              },
            },
          },
        }),
      ]);

      const consumoTotalUltimoMes = lecturasUltimoMes.reduce(
        (total, lectura) => total + (lectura.consumoCalculado ? Number(lectura.consumoCalculado) : 0),
        0,
      );

      const fechaActual = new Date();
      const meses = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
      const periodoActual = `${meses[fechaActual.getMonth()]}/${fechaActual.getFullYear()}`;

      return {
        success: true,
        message: 'Resumen obtenido correctamente',
        resumen: {
          totalMedidores,
          medidoresActivos,
          ultimoMes: {
            periodo: periodoActual,
            consumoTotal: consumoTotalUltimoMes,
            lecturas: lecturasUltimoMes.length,
          },
          alertas: {
            sinLecturasRecientes: medidoresSinLecturasRecientes,
            conAnomalias: lecturasConAnomalias,
          },
        },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al obtener resumen: ' + (error as Error).message,
        resumen: {
          totalMedidores: 0,
          medidoresActivos: 0,
          ultimoMes: { periodo: 'Error', consumoTotal: 0, lecturas: 0 },
          alertas: { sinLecturasRecientes: 0, conAnomalias: 0 },
        },
      };
    }
  }

  // ============================================
  // ENDPOINT BÁSICO - COMPARATIVO BÁSICO
  // ============================================

  @Get('comparativo-mensual')
  @HttpCode(HttpStatus.OK)
  async obtenerComparativoMensual(
    @GetUser() user: AuthenticatedUser,
    @GetCooperativaId() cooperativaId: string,
    @Query('meses') meses: string = '6',
  ): Promise<{
    success: boolean;
    message: string;
    comparativo: Array<{
      periodo: string;
      mes: number;
      anio: number;
      consumoTotal: number;
      lecturas: number;
      variacion?: number;
    }>;
  }> {
    try {
      // Buscar la persona vinculada al usuario
      const usuarioCooperativa = await this.personasService['prisma'].usuarioCooperativa.findFirst({
        where: { 
          usuarioId: user.id, 
          cooperativaId,
          activo: true,
        },
        include: { 
          usuario: true,
          persona: true,
        },
      });

      if (!usuarioCooperativa?.persona) {
        return {
          success: false,
          message: 'No tienes una persona vinculada',
          comparativo: [],
        };
      }

      const mesesNum = parseInt(meses, 10);
      const fechaInicio = new Date();
      fechaInicio.setMonth(fechaInicio.getMonth() - mesesNum);

      // Obtener lecturas por mes
      const lecturasPorMes = await this.personasService['prisma'].lectura.findMany({
        where: {
          medidor: {
            cuentasServicios: {
              some: {
                cuenta: {
                  titularServicioId: usuarioCooperativa.persona.id,
                  cooperativaId,
                },
              },
            },
          },
          fechaLectura: {
            gte: fechaInicio,
          },
          esPrincipal: true,
        },
        select: {
          mes: true,
          anio: true,
          consumoCalculado: true,
        },
        orderBy: [
          { anio: 'asc' },
          { mes: 'asc' },
        ],
      });

      // Agrupar por mes/año
      const mesesMap = new Map();
      for (const lectura of lecturasPorMes) {
        const key = `${lectura.mes}-${lectura.anio}`;
        if (!mesesMap.has(key)) {
          mesesMap.set(key, {
            mes: lectura.mes,
            anio: lectura.anio,
            consumoTotal: 0,
            lecturas: 0,
          });
        }
        const data = mesesMap.get(key) as {
          mes: number;
          anio: number;
          consumoTotal: number;
          lecturas: number;
        };
        data.consumoTotal += lectura.consumoCalculado ? Number(lectura.consumoCalculado) : 0;
        data.lecturas++;
      }

      // Convertir a array y calcular variaciones
      const mesesNombres = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
      const resultado = Array.from(mesesMap.values()).map((mes, index, array) => {
        const mesAnterior = array[index - 1];
        let variacion: number | undefined;

        if (mesAnterior && mesAnterior.consumoTotal > 0) {
          variacion = ((mes.consumoTotal - mesAnterior.consumoTotal) / mesAnterior.consumoTotal) * 100;
        }

        return {
          periodo: `${mesesNombres[mes.mes - 1]}/${mes.anio}`,
          mes: mes.mes,
          anio: mes.anio,
          consumoTotal: mes.consumoTotal,
          lecturas: mes.lecturas,
          variacion: variacion ? Math.round(variacion * 100) / 100 : undefined,
        };
      });

      return {
        success: true,
        message: `Comparativo de ${resultado.length} meses obtenido correctamente`,
        comparativo: resultado,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al obtener comparativo: ' + (error as Error).message,
        comparativo: [],
      };
    }
  }
}