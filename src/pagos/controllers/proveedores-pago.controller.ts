import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RequireAdmin, EmpleadoOnly } from '../../auth/decorators/auth.decorators';
import { GetCooperativaId } from '../../auth/decorators/user.decorators';
import { ProveedoresPagoService } from '../services/proveedores-pago.service';
import {
  CrearProveedorPagoDto,
  ActualizarProveedorPagoDto,
  ConfigurarProveedorCooperativaDto,
  ActualizarProveedorCooperativaDto,
  BuscarProveedoresDto,
  ConsultarEstadisticasProveedorDto,
  RespuestaProveedorPagoDto,
  RespuestaProveedorCooperativaDto,
} from '../dto/proveedores-pago.dto';

@Controller('proveedores-pago')
@UseGuards(JwtAuthGuard)
export class ProveedoresPagoController {
  constructor(private readonly proveedoresPagoService: ProveedoresPagoService) {}

  // ============================================
  // GESTIÓN DE PROVEEDORES DE PAGO (ADMIN)
  // ============================================

  @Post()
  @RequireAdmin()
  @HttpCode(HttpStatus.CREATED)
  async crearProveedor(@Body() createDto: CrearProveedorPagoDto): Promise<{
    success: boolean;
    message: string;
    proveedor: RespuestaProveedorPagoDto;
  }> {
    try {
      const proveedor = await this.proveedoresPagoService.crearProveedor(createDto);
      
      return {
        success: true,
        message: 'Proveedor de pago creado exitosamente',
        proveedor: this.mapearProveedorADto(proveedor),
      };
    } catch (error) {
      throw new BadRequestException(`Error al crear proveedor: ${error.message}`);
    }
  }

  @Get()
  @EmpleadoOnly()
  @HttpCode(HttpStatus.OK)
  async obtenerProveedores(@Query() filtros: BuscarProveedoresDto): Promise<{
    success: boolean;
    proveedores: RespuestaProveedorPagoDto[];
    pagination: {
      total: number;
      pagina: number;
      limite: number;
      totalPaginas: number;
    };
  }> {
    try {
      const resultado = await this.proveedoresPagoService.obtenerProveedores(filtros);
      
      return {
        success: true,
        proveedores: resultado.proveedores.map(this.mapearProveedorADto),
        pagination: {
          total: resultado.total,
          pagina: resultado.pagina,
          limite: resultado.limite,
          totalPaginas: Math.ceil(resultado.total / resultado.limite),
        },
      };
    } catch (error) {
      throw new BadRequestException(`Error al obtener proveedores: ${error.message}`);
    }
  }

  @Get(':id')
  @EmpleadoOnly()
  @HttpCode(HttpStatus.OK)
  async obtenerProveedorPorId(@Param('id') id: string): Promise<{
    success: boolean;
    proveedor: RespuestaProveedorPagoDto;
  }> {
    try {
      const proveedor = await this.proveedoresPagoService.obtenerProveedorPorId(id);
      
      return {
        success: true,
        proveedor: this.mapearProveedorADto(proveedor),
      };
    } catch (error) {
      throw new BadRequestException(`Error al obtener proveedor: ${error.message}`);
    }
  }

  @Put(':id')
  @RequireAdmin()
  @HttpCode(HttpStatus.OK)
  async actualizarProveedor(
    @Param('id') id: string,
    @Body() updateDto: ActualizarProveedorPagoDto,
  ): Promise<{
    success: boolean;
    message: string;
    proveedor: RespuestaProveedorPagoDto;
  }> {
    try {
      const proveedor = await this.proveedoresPagoService.actualizarProveedor(id, updateDto);
      
      return {
        success: true,
        message: 'Proveedor actualizado exitosamente',
        proveedor: this.mapearProveedorADto(proveedor),
      };
    } catch (error) {
      throw new BadRequestException(`Error al actualizar proveedor: ${error.message}`);
    }
  }

  @Delete(':id')
  @RequireAdmin()
  @HttpCode(HttpStatus.OK)
  async eliminarProveedor(@Param('id') id: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      await this.proveedoresPagoService.eliminarProveedor(id);
      
      return {
        success: true,
        message: 'Proveedor eliminado exitosamente',
      };
    } catch (error) {
      throw new BadRequestException(`Error al eliminar proveedor: ${error.message}`);
    }
  }

  // ============================================
  // CONFIGURACIÓN POR COOPERATIVA
  // ============================================

  @Post('cooperativa/configurar')
  @RequireAdmin()
  @HttpCode(HttpStatus.CREATED)
  async configurarProveedorCooperativa(
    @GetCooperativaId() cooperativaId: string,
    @Body() configDto: ConfigurarProveedorCooperativaDto,
  ): Promise<{
    success: boolean;
    message: string;
    configuracion: RespuestaProveedorCooperativaDto;
  }> {
    try {
      const configuracion = await this.proveedoresPagoService.configurarProveedorParaCooperativa(
        cooperativaId,
        configDto,
      );
      
      return {
        success: true,
        message: 'Proveedor configurado exitosamente para la cooperativa',
        configuracion: this.mapearConfiguracionADto(configuracion),
      };
    } catch (error) {
      throw new BadRequestException(`Error al configurar proveedor: ${error.message}`);
    }
  }

  @Get('cooperativa/configuracion')
  @EmpleadoOnly()
  @HttpCode(HttpStatus.OK)
  async obtenerConfiguracionCooperativa(
    @GetCooperativaId() cooperativaId: string,
  ): Promise<{
    success: boolean;
    configuracion: RespuestaProveedorCooperativaDto | null;
  }> {
    try {
      const configuracion = await this.proveedoresPagoService.obtenerConfiguracionCooperativa(cooperativaId);
      
      return {
        success: true,
        configuracion: configuracion ? this.mapearConfiguracionADto(configuracion) : null,
      };
    } catch (error) {
      throw new BadRequestException(`Error al obtener configuración: ${error.message}`);
    }
  }

  @Put('cooperativa/configuracion')
  @RequireAdmin()
  @HttpCode(HttpStatus.OK)
  async actualizarConfiguracionCooperativa(
    @GetCooperativaId() cooperativaId: string,
    @Body() updateDto: ActualizarProveedorCooperativaDto,
  ): Promise<{
    success: boolean;
    message: string;
    configuracion: RespuestaProveedorCooperativaDto;
  }> {
    try {
      const configuracion = await this.proveedoresPagoService.actualizarConfiguracionCooperativa(
        cooperativaId,
        updateDto,
      );
      
      return {
        success: true,
        message: 'Configuración actualizada exitosamente',
        configuracion: this.mapearConfiguracionADto(configuracion),
      };
    } catch (error) {
      throw new BadRequestException(`Error al actualizar configuración: ${error.message}`);
    }
  }

  @Delete('cooperativa/configuracion')
  @RequireAdmin()
  @HttpCode(HttpStatus.OK)
  async deshabilitarProveedorCooperativa(
    @GetCooperativaId() cooperativaId: string,
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      await this.proveedoresPagoService.deshabilitarProveedorCooperativa(cooperativaId);
      
      return {
        success: true,
        message: 'Proveedor deshabilitado exitosamente',
      };
    } catch (error) {
      throw new BadRequestException(`Error al deshabilitar proveedor: ${error.message}`);
    }
  }

  // ============================================
  // VERIFICACIÓN Y MANTENIMIENTO
  // ============================================

  @Post('cooperativa/verificar-conexion')
  @EmpleadoOnly()
  @HttpCode(HttpStatus.OK)
  async verificarConexion(@GetCooperativaId() cooperativaId: string): Promise<{
    success: boolean;
    conexion: {
      conectado: boolean;
      mensaje: string;
      detalles?: any;
    };
  }> {
    try {
      const resultado = await this.proveedoresPagoService.verificarConexion(cooperativaId);
      
      return {
        success: true,
        conexion: resultado,
      };
    } catch (error) {
      throw new BadRequestException(`Error al verificar conexión: ${error.message}`);
    }
  }

  @Get('cooperativa/estadisticas')
  @EmpleadoOnly()
  @HttpCode(HttpStatus.OK)
  async obtenerEstadisticas(
    @GetCooperativaId() cooperativaId: string,
    @Query() filtros: ConsultarEstadisticasProveedorDto,
  ): Promise<{
    success: boolean;
    estadisticas: any;
  }> {
    try {
      const estadisticas = await this.proveedoresPagoService.obtenerEstadisticas(cooperativaId, filtros);
      
      return {
        success: true,
        estadisticas,
      };
    } catch (error) {
      throw new BadRequestException(`Error al obtener estadísticas: ${error.message}`);
    }
  }

  // ============================================
  // MÉTODOS UTILITARIOS PRIVADOS
  // ============================================

  private mapearProveedorADto(proveedor: any): RespuestaProveedorPagoDto {
    return {
      id: proveedor.id,
      nombre: proveedor.nombre,
      codigo: proveedor.codigo,
      tipo: proveedor.tipo,
      descripcion: proveedor.descripcion,
      logoUrl: proveedor.logoUrl,
      sitioWeb: proveedor.sitioWeb,
      soportaWebhooks: proveedor.soportaWebhooks,
      soportaTarjetas: proveedor.soportaTarjetas,
      soportaTransferencias: proveedor.soportaTransferencias,
      soportaEfectivo: proveedor.soportaEfectivo,
      soportaRecurrentes: proveedor.soportaRecurrentes,
      montoMinimo: proveedor.montoMinimo ? Number(proveedor.montoMinimo) : undefined,
      montoMaximo: proveedor.montoMaximo ? Number(proveedor.montoMaximo) : undefined,
      estado: proveedor.estado,
      activo: proveedor.activo,
      paisesDisponibles: proveedor.paisesDisponibles,
      monedasSoportadas: proveedor.monedasSoportadas,
      createdAt: proveedor.createdAt,
      updatedAt: proveedor.updatedAt,
    };
  }

  private mapearConfiguracionADto(configuracion: any): RespuestaProveedorCooperativaDto {
    return {
      id: configuracion.id,
      activo: configuracion.activo,
      esPrincipal: configuracion.esPrincipal,
      entornoPruebas: configuracion.entornoPruebas,
      estadoConexion: configuracion.estadoConexion,
      fechaIntegracion: configuracion.fechaIntegracion,
      fechaUltimaConexion: configuracion.fechaUltimaConexion,
      totalTransacciones: configuracion.totalTransacciones,
      montoTotalProcesado: Number(configuracion.montoTotalProcesado),
      ultimaTransaccion: configuracion.ultimaTransaccion,
      proveedor: configuracion.proveedorPago ? this.mapearProveedorADto(configuracion.proveedorPago) : undefined,
      // Nota: No incluimos tokens ni claves por seguridad
    };
  }
}