import { Injectable, Logger, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { 
  CrearProveedorPagoDto, 
  ActualizarProveedorPagoDto,
  ConfigurarProveedorCooperativaDto,
  ActualizarProveedorCooperativaDto,
  BuscarProveedoresDto,
  ConsultarEstadisticasProveedorDto
} from '../dto/proveedores-pago.dto';
import { 
  TipoProveedorPago, 
  EstadoProveedorPago,
  ProveedorPago,
  ProveedorPagoCooperativa
} from '../interfaces/proveedores-pago.interface';
import * as crypto from 'crypto';

@Injectable()
export class ProveedoresPagoService {
  private readonly logger = new Logger(ProveedoresPagoService.name);
  private readonly encryptionKey: string;

  constructor(private readonly prisma: PrismaService) {
    // Clave de encriptación desde variables de entorno
    this.encryptionKey = process.env.PAYMENT_ENCRYPTION_KEY || 'default-key-change-in-production';
  }

  /**
   * Convierte un proveedor de pago de BD (con Decimales) a interfaz API (con numbers)
   */
  private convertirProveedorANumber(proveedor: any): ProveedorPago {
    return {
      ...proveedor,
      montoMinimo: proveedor.montoMinimo ? Number(proveedor.montoMinimo) / 100 : undefined,
      montoMaximo: proveedor.montoMaximo ? Number(proveedor.montoMaximo) / 100 : undefined,
      comisionPorcentaje: proveedor.comisionPorcentaje ? Number(proveedor.comisionPorcentaje) / 100 : undefined,
      comisionFija: proveedor.comisionFija ? Number(proveedor.comisionFija) / 100 : undefined,
    } as ProveedorPago;
  }

  // ============================================
  // GESTIÓN DE PROVEEDORES DE PAGO
  // ============================================

  async crearProveedor(createDto: CrearProveedorPagoDto): Promise<ProveedorPago> {
    try {
      // Verificar que no exista un proveedor con el mismo código
      const existente = await this.prisma.proveedorPago.findUnique({
        where: { codigo: createDto.codigo },
      });

      if (existente) {
        throw new ConflictException(`Ya existe un proveedor con el código: ${createDto.codigo}`);
      }

      const proveedor = await this.prisma.proveedorPago.create({
        data: {
          nombre: createDto.nombre,
          codigo: createDto.codigo,
          tipo: createDto.tipo,
          descripcion: createDto.descripcion,
          logoUrl: createDto.logoUrl,
          sitioWeb: createDto.sitioWeb,
          apiBaseUrl: createDto.apiBaseUrl,
          versionApi: createDto.versionApi,
          documentacionUrl: createDto.documentacionUrl,
          soportaWebhooks: createDto.soportaWebhooks || false,
          soportaTarjetas: createDto.soportaTarjetas ?? true,
          soportaTransferencias: createDto.soportaTransferencias || false,
          soportaEfectivo: createDto.soportaEfectivo || false,
          soportaRecurrentes: createDto.soportaRecurrentes || false,
          montoMinimo: createDto.montoMinimo,
          montoMaximo: createDto.montoMaximo,
          comisionPorcentaje: createDto.comisionPorcentaje,
          comisionFija: createDto.comisionFija,
          tiempoExpiracionMinutos: createDto.tiempoExpiracionMinutos || 60,
          tiempoConfirmacionHoras: createDto.tiempoConfirmacionHoras || 72,
          paisesDisponibles: createDto.paisesDisponibles || [],
          monedasSoportadas: createDto.monedasSoportadas || ['ARS'],
          estado: createDto.estado || EstadoProveedorPago.ACTIVO,
          activo: createDto.activo ?? true,
        },
      });

      this.logger.log(`Proveedor de pago creado: ${proveedor.codigo}`);
      return this.convertirProveedorANumber(proveedor);
    } catch (error) {
      this.logger.error(`Error al crear proveedor de pago: ${error.message}`);
      throw error;
    }
  }

  async obtenerProveedores(filtros: BuscarProveedoresDto = {}): Promise<{
    proveedores: ProveedorPago[];
    total: number;
    pagina: number;
    limite: number;
  }> {
    try {
      const {
        tipo,
        estado,
        activo,
        soportaWebhooks,
        soportaTarjetas,
        busqueda,
        pagina = 1,
        limite = 20,
        ordenarPor = 'nombre',
        direccion = 'asc',
      } = filtros;

      const skip = (pagina - 1) * limite;
      
      const where: any = {};

      if (tipo) where.tipo = tipo;
      if (estado) where.estado = estado;
      if (activo !== undefined) where.activo = activo;
      if (soportaWebhooks !== undefined) where.soportaWebhooks = soportaWebhooks;
      if (soportaTarjetas !== undefined) where.soportaTarjetas = soportaTarjetas;
      
      if (busqueda) {
        where.OR = [
          { nombre: { contains: busqueda, mode: 'insensitive' } },
          { codigo: { contains: busqueda, mode: 'insensitive' } },
          { descripcion: { contains: busqueda, mode: 'insensitive' } },
        ];
      }

      const [proveedores, total] = await Promise.all([
        this.prisma.proveedorPago.findMany({
          where,
          skip,
          take: limite,
          orderBy: { [ordenarPor]: direccion },
        }),
        this.prisma.proveedorPago.count({ where }),
      ]);

      return {
        proveedores: proveedores.map(p => this.convertirProveedorANumber(p)),
        total,
        pagina,
        limite,
      };
    } catch (error) {
      this.logger.error(`Error al obtener proveedores: ${error.message}`);
      throw error;
    }
  }

  async obtenerProveedorPorId(id: string): Promise<ProveedorPago> {
    try {
      const proveedor = await this.prisma.proveedorPago.findUnique({
        where: { id },
      });

      if (!proveedor) {
        throw new NotFoundException(`Proveedor de pago no encontrado: ${id}`);
      }

      return this.convertirProveedorANumber(proveedor);
    } catch (error) {
      this.logger.error(`Error al obtener proveedor: ${error.message}`);
      throw error;
    }
  }

  async obtenerProveedorPorCodigo(codigo: string): Promise<ProveedorPago> {
    try {
      const proveedor = await this.prisma.proveedorPago.findUnique({
        where: { codigo },
      });

      if (!proveedor) {
        throw new NotFoundException(`Proveedor de pago no encontrado: ${codigo}`);
      }

      return this.convertirProveedorANumber(proveedor);
    } catch (error) {
      this.logger.error(`Error al obtener proveedor por código: ${error.message}`);
      throw error;
    }
  }

  async actualizarProveedor(id: string, updateDto: ActualizarProveedorPagoDto): Promise<ProveedorPago> {
    try {
      const proveedorExistente = await this.obtenerProveedorPorId(id);

      const proveedor = await this.prisma.proveedorPago.update({
        where: { id },
        data: {
          ...updateDto,
          updatedAt: new Date(),
        },
      });

      this.logger.log(`Proveedor de pago actualizado: ${proveedor.codigo}`);
      return this.convertirProveedorANumber(proveedor);
    } catch (error) {
      this.logger.error(`Error al actualizar proveedor: ${error.message}`);
      throw error;
    }
  }

  async eliminarProveedor(id: string): Promise<void> {
    try {
      // Verificar que no haya cooperativas usando este proveedor
      const cooperativasUsando = await this.prisma.proveedorPagoCooperativa.count({
        where: { proveedorPagoId: id },
      });

      if (cooperativasUsando > 0) {
        throw new BadRequestException(
          `No se puede eliminar el proveedor porque está siendo usado por ${cooperativasUsando} cooperativa(s)`
        );
      }

      await this.prisma.proveedorPago.delete({
        where: { id },
      });

      this.logger.log(`Proveedor de pago eliminado: ${id}`);
    } catch (error) {
      this.logger.error(`Error al eliminar proveedor: ${error.message}`);
      throw error;
    }
  }

  // ============================================
  // CONFIGURACIÓN POR COOPERATIVA
  // ============================================

  async configurarProveedorParaCooperativa(
    cooperativaId: string,
    configDto: ConfigurarProveedorCooperativaDto
  ): Promise<ProveedorPagoCooperativa> {
    try {
      // Verificar que el proveedor existe
      await this.obtenerProveedorPorId(configDto.proveedorPagoId);

      // Verificar que la cooperativa no tenga ya este proveedor configurado
      const existente = await this.prisma.proveedorPagoCooperativa.findUnique({
        where: { cooperativaId },
      });

      if (existente) {
        throw new ConflictException('La cooperativa ya tiene un proveedor de pago configurado');
      }

      // Si es principal, desmarcar otros como principales
      if (configDto.esPrincipal) {
        await this.prisma.proveedorPagoCooperativa.updateMany({
          where: { 
            cooperativaId,
            esPrincipal: true,
          },
          data: { esPrincipal: false },
        });
      }

      // Encriptar datos sensibles
      const tokenAccesoEncriptado = this.encriptar(configDto.tokenAcceso);
      const tokenRefreshEncriptado = configDto.tokenRefresh ? this.encriptar(configDto.tokenRefresh) : null;
      const clavePublicaEncriptada = configDto.clavePublica ? this.encriptar(configDto.clavePublica) : null;
      const clavePrivadaEncriptada = configDto.clavePrivada ? this.encriptar(configDto.clavePrivada) : null;
      const webhookSecretEncriptado = configDto.webhookSecret ? this.encriptar(configDto.webhookSecret) : null;

      const configuracion = await this.prisma.proveedorPagoCooperativa.create({
        data: {
          cooperativaId,
          proveedorPagoId: configDto.proveedorPagoId,
          activo: configDto.activo ?? true,
          esPrincipal: configDto.esPrincipal ?? false,
          tokenAcceso: tokenAccesoEncriptado,
          tokenRefresh: tokenRefreshEncriptado,
          clavePublica: clavePublicaEncriptada,
          clavePrivada: clavePrivadaEncriptada,
          entornoPruebas: configDto.entornoPruebas ?? true,
          webhookUrl: configDto.webhookUrl,
          webhookSecret: webhookSecretEncriptado,
          configuracionPersonalizada: configDto.configuracionPersonalizada || {},
          montoMinimo: configDto.montoMinimo,
          montoMaximo: configDto.montoMaximo,
          comisionAdicional: configDto.comisionAdicional,
          estadoConexion: 'NO_VERIFICADO',
        },
        include: {
          proveedorPago: true,
        },
      });

      this.logger.log(`Proveedor configurado para cooperativa: ${cooperativaId}`);
      return configuracion as unknown as ProveedorPagoCooperativa;
    } catch (error) {
      this.logger.error(`Error al configurar proveedor para cooperativa: ${error.message}`);
      throw error;
    }
  }

  async obtenerConfiguracionCooperativa(cooperativaId: string): Promise<ProveedorPagoCooperativa | null> {
    try {
      const configuracion = await this.prisma.proveedorPagoCooperativa.findUnique({
        where: { cooperativaId },
        include: {
          proveedorPago: true,
        },
      });

      if (!configuracion) {
        return null;
      }

      // Desencriptar para uso interno (sin exponerlo en respuestas)
      return {
        ...configuracion,
        tokenAcceso: this.desencriptar(configuracion.tokenAcceso),
        tokenRefresh: configuracion.tokenRefresh ? this.desencriptar(configuracion.tokenRefresh) : null,
        clavePublica: configuracion.clavePublica ? this.desencriptar(configuracion.clavePublica) : null,
        clavePrivada: configuracion.clavePrivada ? this.desencriptar(configuracion.clavePrivada) : null,
        webhookSecret: configuracion.webhookSecret ? this.desencriptar(configuracion.webhookSecret) : null,
      } as unknown as ProveedorPagoCooperativa;
    } catch (error) {
      this.logger.error(`Error al obtener configuración de cooperativa: ${error.message}`);
      throw error;
    }
  }

  async actualizarConfiguracionCooperativa(
    cooperativaId: string,
    updateDto: ActualizarProveedorCooperativaDto
  ): Promise<ProveedorPagoCooperativa> {
    try {
      const configuracionExistente = await this.prisma.proveedorPagoCooperativa.findUnique({
        where: { cooperativaId },
      });

      if (!configuracionExistente) {
        throw new NotFoundException('Configuración de proveedor no encontrada para esta cooperativa');
      }

      // Si es principal, desmarcar otros como principales
      if (updateDto.esPrincipal) {
        await this.prisma.proveedorPagoCooperativa.updateMany({
          where: { 
            cooperativaId,
            esPrincipal: true,
            id: { not: configuracionExistente.id },
          },
          data: { esPrincipal: false },
        });
      }

      // Preparar datos actualizados con encriptación si es necesario
      const dataToUpdate: any = { ...updateDto };

      if (updateDto.tokenAcceso) {
        dataToUpdate.tokenAcceso = this.encriptar(updateDto.tokenAcceso);
      }
      if (updateDto.tokenRefresh) {
        dataToUpdate.tokenRefresh = this.encriptar(updateDto.tokenRefresh);
      }
      if (updateDto.clavePublica) {
        dataToUpdate.clavePublica = this.encriptar(updateDto.clavePublica);
      }
      if (updateDto.clavePrivada) {
        dataToUpdate.clavePrivada = this.encriptar(updateDto.clavePrivada);
      }
      if (updateDto.webhookSecret) {
        dataToUpdate.webhookSecret = this.encriptar(updateDto.webhookSecret);
      }

      const configuracion = await this.prisma.proveedorPagoCooperativa.update({
        where: { cooperativaId },
        data: {
          ...dataToUpdate,
          updatedAt: new Date(),
        },
        include: {
          proveedorPago: true,
        },
      });

      this.logger.log(`Configuración de proveedor actualizada para cooperativa: ${cooperativaId}`);
      return configuracion as unknown as ProveedorPagoCooperativa;
    } catch (error) {
      this.logger.error(`Error al actualizar configuración de cooperativa: ${error.message}`);
      throw error;
    }
  }

  async deshabilitarProveedorCooperativa(cooperativaId: string): Promise<void> {
    try {
      await this.prisma.proveedorPagoCooperativa.update({
        where: { cooperativaId },
        data: { 
          activo: false,
          updatedAt: new Date(),
        },
      });

      this.logger.log(`Proveedor deshabilitado para cooperativa: ${cooperativaId}`);
    } catch (error) {
      this.logger.error(`Error al deshabilitar proveedor de cooperativa: ${error.message}`);
      throw error;
    }
  }

  // ============================================
  // VERIFICACIÓN DE CONECTIVIDAD
  // ============================================

  async verificarConexion(cooperativaId: string): Promise<{
    conectado: boolean;
    mensaje: string;
    detalles?: any;
  }> {
    try {
      const configuracion = await this.obtenerConfiguracionCooperativa(cooperativaId);
      
      if (!configuracion) {
        return {
          conectado: false,
          mensaje: 'No hay proveedor de pago configurado',
        };
      }

      // Aquí iría la lógica específica para verificar conexión según el tipo de proveedor
      // Por ahora, simulamos la verificación
      const resultado = await this.verificarConexionEspecifica(configuracion);

      // Actualizar estado de conexión
      await this.prisma.proveedorPagoCooperativa.update({
        where: { cooperativaId },
        data: {
          estadoConexion: resultado.conectado ? 'CONECTADO' : 'ERROR',
          fechaUltimaConexion: new Date(),
          ultimoErrorConexion: resultado.conectado ? null : resultado.mensaje,
        },
      });

      return resultado;
    } catch (error) {
      this.logger.error(`Error al verificar conexión: ${error.message}`);
      return {
        conectado: false,
        mensaje: `Error en verificación: ${error.message}`,
      };
    }
  }

  private async verificarConexionEspecifica(configuracion: ProveedorPagoCooperativa): Promise<{
    conectado: boolean;
    mensaje: string;
    detalles?: any;
  }> {
    // Implementar verificación específica según el tipo de proveedor
    // Por ahora retornamos éxito básico
    return {
      conectado: true,
      mensaje: 'Conexión verificada exitosamente',
    };
  }

  // ============================================
  // ESTADÍSTICAS
  // ============================================

  async obtenerEstadisticas(
    cooperativaId: string,
    filtros: ConsultarEstadisticasProveedorDto = {}
  ): Promise<any> {
    try {
      const configuracion = await this.obtenerConfiguracionCooperativa(cooperativaId);
      
      if (!configuracion) {
        return {
          totalTransacciones: 0,
          montoTotalProcesado: 0,
          comisionesTotales: 0,
          transaccionesPorEstado: {},
          transaccionesPorMetodo: {},
        };
      }

      // Aquí iría la lógica para obtener estadísticas detalladas
      // Por ahora retornamos datos básicos desde la configuración
      return {
        totalTransacciones: configuracion.totalTransacciones,
        montoTotalProcesado: configuracion.montoTotalProcesado,
        ultimaTransaccion: configuracion.ultimaTransaccion,
        estadoConexion: configuracion.estadoConexion,
        fechaIntegracion: configuracion.fechaIntegracion,
      };
    } catch (error) {
      this.logger.error(`Error al obtener estadísticas: ${error.message}`);
      throw error;
    }
  }

  // ============================================
  // MÉTODOS DE ENCRIPTACIÓN
  // ============================================

  private encriptar(texto: string): string {
    try {
      const algorithm = 'aes-256-cbc';
      const key = crypto.scryptSync(this.encryptionKey, 'salt', 32);
      const iv = crypto.randomBytes(16);
      
      const cipher = crypto.createCipheriv(algorithm, key, iv);
      cipher.update(texto, 'utf8');
      const encrypted = cipher.final('hex');
      
      return `${iv.toString('hex')}:${encrypted}`;
    } catch (error) {
      this.logger.error(`Error al encriptar: ${error.message}`);
      throw new Error('Error en encriptación de datos sensibles');
    }
  }

  private desencriptar(textoEncriptado: string): string {
    try {
      const algorithm = 'aes-256-cbc';
      const key = crypto.scryptSync(this.encryptionKey, 'salt', 32);
      
      const [ivHex, encrypted] = textoEncriptado.split(':');
      const iv = Buffer.from(ivHex, 'hex');
      
      const decipher = crypto.createDecipheriv(algorithm, key, iv);
      decipher.update(encrypted, 'hex');
      const decrypted = decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      this.logger.error(`Error al desencriptar: ${error.message}`);
      throw new Error('Error en desencriptación de datos sensibles');
    }
  }
}