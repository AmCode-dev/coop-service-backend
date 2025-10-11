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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionGuard } from '../../auth/guards/permission.guard';
import { GetUser } from '../../auth/decorators/user.decorators';
import { RequirePermissions } from '../../auth/decorators/auth.decorators';
import type { AuthenticatedUser } from '../../auth/interfaces/auth.interface';
import { InmueblesService } from '../services/inmuebles-simple.service';
import { LegajosService } from '../services/legajos.service';
import {
  CreateInmuebleDto,
  UpdateInmuebleDto,
  InmuebleFilterDto,
  TransferenciaTitularidadDto,
  AsociarCuentaDto,
  DeshabilitarInmuebleDto,
} from '../dto';

@Controller('cooperativas/:cooperativaId/inmuebles')
@UseGuards(JwtAuthGuard)
export class InmueblesController {
  constructor(
    private readonly inmueblesService: InmueblesService,
    private readonly legajosService: LegajosService,
  ) {}

  /**
   * Crear un nuevo inmueble
   * Solo administradores o usuarios con permisos EXECUTE en inmuebles
   */
  @Post()
  @UseGuards(PermissionGuard)
  @RequirePermissions('inmuebles', 'EXECUTE')
  async crearInmueble(
    @Param('cooperativaId') cooperativaId: string,
    @Body() createInmuebleDto: CreateInmuebleDto,
    @GetUser() user: AuthenticatedUser,
  ) {
    return this.inmueblesService.crearInmueble(
      cooperativaId,
      createInmuebleDto,
      user.id,
    );
  }

  /**
   * Obtener todos los inmuebles con filtros
   * Todos los usuarios de la cooperativa (con restricciones según rol)
   */
  @Get()
  async obtenerInmuebles(
    @Param('cooperativaId') cooperativaId: string,
    @Query() filtros: InmuebleFilterDto,
    @GetUser() user: AuthenticatedUser,
  ) {
    const esAdmin = user.roles?.some(
      (rol) =>
        rol.nombre === 'Administrador' ||
        user.permisos?.some(
          (p) =>
            p.seccionCodigo === 'inmuebles' &&
            p.acciones.includes('EXECUTE' as any),
        ),
    );

    return this.inmueblesService.obtenerInmuebles(
      cooperativaId,
      filtros,
      user.id,
      esAdmin,
    );
  }

  /**
   * Obtener un inmueble específico
   * Todos los usuarios de la cooperativa (con restricciones según rol)
   */
  @Get(':inmuebleId')
  async obtenerInmueble(
    @Param('cooperativaId') cooperativaId: string,
    @Param('inmuebleId') inmuebleId: string,
    @GetUser() user: AuthenticatedUser,
  ) {
    const esAdmin = user.roles?.some(
      (rol) =>
        rol.nombre === 'Administrador' ||
        user.permisos?.some(
          (p) =>
            p.seccionCodigo === 'inmuebles' &&
            p.acciones.includes('EXECUTE' as any),
        ),
    );

    return this.inmueblesService.obtenerInmueblePorId(
      inmuebleId,
      cooperativaId,
      user.id,
      esAdmin,
    );
  }

  /**
   * Actualizar un inmueble
   * Solo administradores o usuarios con permisos EXECUTE en inmuebles
   */
  @Put(':inmuebleId')
  @UseGuards(PermissionGuard)
  @RequirePermissions('inmuebles', 'EXECUTE')
  async actualizarInmueble(
    @Param('cooperativaId') cooperativaId: string,
    @Param('inmuebleId') inmuebleId: string,
    @Body() updateInmuebleDto: UpdateInmuebleDto,
    @GetUser() user: AuthenticatedUser,
  ) {
    return this.inmueblesService.actualizarInmueble(
      inmuebleId,
      cooperativaId,
      updateInmuebleDto,
      user.id,
    );
  }

  /**
   * Deshabilitar un inmueble (baja lógica)
   * Solo administradores o usuarios con permisos EXECUTE en inmuebles
   */
  @Delete(':inmuebleId')
  @UseGuards(PermissionGuard)
  @RequirePermissions('inmuebles', 'EXECUTE')
  async deshabilitarInmueble(
    @Param('cooperativaId') cooperativaId: string,
    @Param('inmuebleId') inmuebleId: string,
    @Body() deshabilitarDto: DeshabilitarInmuebleDto,
    @GetUser() user: AuthenticatedUser,
  ) {
    return this.inmueblesService.deshabilitarInmueble(
      inmuebleId,
      cooperativaId,
      deshabilitarDto.motivo,
      user.id,
    );
  }

  /**
   * Transferir titularidad de un inmueble
   * Solo administradores o usuarios con permisos EXECUTE en inmuebles
   */
  @Post(':inmuebleId/transferir-titularidad')
  @UseGuards(PermissionGuard)
  @RequirePermissions('inmuebles', 'EXECUTE')
  async transferirTitularidad(
    @Param('cooperativaId') cooperativaId: string,
    @Param('inmuebleId') inmuebleId: string,
    @Body() transferirDto: TransferenciaTitularidadDto,
    @GetUser() user: AuthenticatedUser,
  ) {
    return this.inmueblesService.transferirTitularidad(
      inmuebleId,
      cooperativaId,
      transferirDto,
      user.id,
    );
  }

  /**
   * Asociar cuenta a un inmueble
   * Solo administradores o usuarios con permisos EXECUTE en inmuebles
   */
  @Post(':inmuebleId/asociar-cuenta')
  @UseGuards(PermissionGuard)
  @RequirePermissions('inmuebles', 'EXECUTE')
  async asociarCuenta(
    @Param('cooperativaId') cooperativaId: string,
    @Param('inmuebleId') inmuebleId: string,
    @Body() asociarCuentaDto: AsociarCuentaDto,
    @GetUser() user: AuthenticatedUser,
  ) {
    return this.inmueblesService.asociarCuenta(
      inmuebleId,
      cooperativaId,
      asociarCuentaDto,
      user.id,
    );
  }

  /**
   * Desvincular cuenta de un inmueble
   * Solo administradores o usuarios con permisos EXECUTE en inmuebles
   */
  @Delete(':inmuebleId/cuentas/:cuentaId')
  @UseGuards(PermissionGuard)
  @RequirePermissions('inmuebles', 'EXECUTE')
  async desvincularCuenta(
    @Param('cooperativaId') cooperativaId: string,
    @Param('inmuebleId') inmuebleId: string,
    @Param('cuentaId') cuentaId: string,
    @GetUser() user: AuthenticatedUser,
  ) {
    return this.inmueblesService.desvincularCuenta(
      inmuebleId,
      cuentaId,
      cooperativaId,
      user.id,
    );
  }

  /**
   * ENDPOINTS ESPECÍFICOS PARA LEGAJOS
   */

  /**
   * Obtener legajo de un inmueble
   * Todos los usuarios de la cooperativa pueden ver legajos
   */
  @Get(':inmuebleId/legajo')
  async obtenerLegajo(
    @Param('cooperativaId') cooperativaId: string,
    @Param('inmuebleId') inmuebleId: string,
  ) {
    return this.legajosService.obtenerLegajoPorInmueble(inmuebleId, cooperativaId);
  }

  /**
   * Agregar documento al legajo
   * Solo administradores o usuarios con permisos EXECUTE en inmuebles
   */
  @Post(':inmuebleId/legajo/documentos')
  @UseGuards(PermissionGuard)
  @RequirePermissions('inmuebles', 'EXECUTE')
  @UseInterceptors(FileInterceptor('archivo'))
  async agregarDocumentoLegajo(
    @Param('cooperativaId') cooperativaId: string,
    @Param('inmuebleId') inmuebleId: string,
    @Body() documentoData: any, // Se parsea del form-data
    @UploadedFile() archivo: Express.Multer.File,
    @GetUser() user: AuthenticatedUser,
  ) {
    // Primero obtener el legajo
    const legajo = await this.legajosService.obtenerLegajoPorInmueble(
      inmuebleId,
      cooperativaId,
    );

    const documentoDto = {
      ...documentoData,
      archivo,
    };

    return this.legajosService.agregarDocumento(
      legajo.id,
      documentoDto,
      user.id,
    );
  }

  /**
   * Validar documento del legajo
   * Solo administradores o usuarios con permisos EXECUTE en inmuebles
   */
  @Put(':inmuebleId/legajo/documentos/:documentoId/validar')
  @UseGuards(PermissionGuard)
  @RequirePermissions('inmuebles', 'EXECUTE')
  async validarDocumento(
    @Param('documentoId') documentoId: string,
    @Body() validacionData: { observaciones?: string },
    @GetUser() user: AuthenticatedUser,
  ) {
    return this.legajosService.validarDocumento(
      documentoId,
      user.id,
      validacionData.observaciones,
    );
  }

  /**
   * Agregar anotación al legajo
   * Solo administradores o usuarios con permisos EXECUTE en inmuebles
   */
  @Post(':inmuebleId/legajo/anotaciones')
  @UseGuards(PermissionGuard)
  @RequirePermissions('inmuebles', 'EXECUTE')
  async agregarAnotacion(
    @Param('cooperativaId') cooperativaId: string,
    @Param('inmuebleId') inmuebleId: string,
    @Body() anotacionData: { titulo?: string; contenido: string; importante?: boolean },
    @GetUser() user: AuthenticatedUser,
  ) {
    // Primero obtener el legajo
    const legajo = await this.legajosService.obtenerLegajoPorInmueble(
      inmuebleId,
      cooperativaId,
    );

    return this.legajosService.agregarAnotacion(
      legajo.id,
      anotacionData,
      user.id,
    );
  }

  /**
   * Obtener historial de titularidad
   * Todos los usuarios de la cooperativa pueden ver historial
   */
  @Get(':inmuebleId/historial-titularidad')
  async obtenerHistorialTitularidad(
    @Param('inmuebleId') inmuebleId: string,
  ) {
    return this.legajosService.obtenerHistorialTitularidad(inmuebleId);
  }

  /**
   * Cambiar estado del legajo
   * Solo administradores o usuarios con permisos EXECUTE en inmuebles
   */
  @Put(':inmuebleId/legajo/estado')
  @UseGuards(PermissionGuard)
  @RequirePermissions('inmuebles', 'EXECUTE')
  async cambiarEstadoLegajo(
    @Param('cooperativaId') cooperativaId: string,
    @Param('inmuebleId') inmuebleId: string,
    @Body() estadoData: { estado: string; observaciones?: string },
    @GetUser() user: AuthenticatedUser,
  ) {
    // Primero obtener el legajo
    const legajo = await this.legajosService.obtenerLegajoPorInmueble(
      inmuebleId,
      cooperativaId,
    );

    return this.legajosService.cambiarEstadoLegajo(
      legajo.id,
      estadoData.estado,
      estadoData.observaciones,
      user.id,
    );
  }
}