import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { OnboardingService } from '../services/onboarding.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { GetUser } from '../../auth/decorators/user.decorators';
import { Public, RequirePermissions } from '../../auth/decorators/auth.decorators';
import type { AuthenticatedUser } from '../../auth/interfaces/auth.interface';
import type {
  IniciarOnboardingDto,
  ActualizarDatosOnboardingDto,
  AprobarRechazarDto,
} from '../services/onboarding.service';

@Controller('cooperativas/:cooperativaId/onboarding')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  /**
   * Inicia un nuevo proceso de onboarding
   */
  @Public()
  @Post()
  async iniciarOnboarding(
    @Param('cooperativaId') cooperativaId: string,
    @Body() datos: IniciarOnboardingDto,
    @Req() req: Request,
  ) {
    const sessionInfo = {
      ipAddress: req.ip || req.connection.remoteAddress || 'Unknown',
      userAgent: req.headers['user-agent'] || 'Unknown',
    };

    return this.onboardingService.iniciarOnboarding(
      cooperativaId,
      datos,
      sessionInfo,
    );
  }

  /**
   * Obtiene el estado de un proceso específico
   */
  @Public()
  @Get(':procesoId')
  async obtenerEstadoProceso(
    @Param('cooperativaId') cooperativaId: string,
    @Param('procesoId') procesoId: string,
  ) {
    return this.onboardingService.obtenerEstadoProceso(cooperativaId, procesoId);
  }

  /**
   * Actualiza los datos personales de un proceso
   */
  @Public()
  @Put(':procesoId/datos')
  async actualizarDatos(
    @Param('cooperativaId') cooperativaId: string,
    @Param('procesoId') procesoId: string,
    @Body() datos: ActualizarDatosOnboardingDto,
  ) {
    return this.onboardingService.actualizarDatos(
      cooperativaId,
      procesoId,
      datos,
    );
  }

  /**
   * Sube un documento para el proceso
   */
  @Public()
  @Post(':procesoId/documentos')
  @UseInterceptors(FileInterceptor('archivo'))
  async subirDocumento(
    @Param('cooperativaId') cooperativaId: string,
    @Param('procesoId') procesoId: string,
    @Body() datos: any,
    @UploadedFile() archivo: Express.Multer.File,
  ) {
    // En un entorno real, aquí se procesaría el archivo
    const documentoDto = {
      nombre: datos.nombre,
      tipoDocumento: datos.tipoDocumento,
      descripcion: datos.descripcion,
      esObligatorio: datos.esObligatorio,
      archivo: {
        nombreArchivo: archivo.originalname,
        rutaArchivo: `/uploads/onboarding/${Date.now()}-${archivo.originalname}`,
        tamanoBytes: archivo.size,
        tipoMime: archivo.mimetype,
      },
    };

    return this.onboardingService.subirDocumento(
      cooperativaId,
      procesoId,
      documentoDto,
    );
  }

  /**
   * Valida el email mediante código
   */
  @Public()
  @Post(':procesoId/validar-email')
  async validarEmail(
    @Param('cooperativaId') cooperativaId: string,
    @Param('procesoId') procesoId: string,
    @Body() body: { codigo: string },
  ) {
    return this.onboardingService.validarEmail(
      cooperativaId,
      procesoId,
      body.codigo,
    );
  }

  /**
   * Completa un paso específico del proceso
   */
  @Public()
  @Post(':procesoId/completar-paso')
  async completarPaso(
    @Param('cooperativaId') cooperativaId: string,
    @Param('procesoId') procesoId: string,
    @Body() body: { nombrePaso: string; datos?: any },
  ) {
    return this.onboardingService.completarPaso(
      cooperativaId,
      procesoId,
      body.nombrePaso,
      body.datos,
    );
  }

  // Endpoints protegidos para SUPER_ADMIN

  /**
   * Lista todos los procesos de onboarding
   * Solo SUPER_ADMIN puede ver todos los procesos
   */
  @UseGuards(JwtAuthGuard)
  @RequirePermissions('SYSTEM', 'READ')
  @Get()
  async listarProcesos(
    @Param('cooperativaId') cooperativaId: string,
    @Query() filtros: any,
    @GetUser() user: AuthenticatedUser,
  ) {
    // Solo SUPER_ADMIN puede gestionar procesos de onboarding
    if (!user.roles.some((r) => r.nombre === 'SUPER_ADMIN')) {
      throw new Error('Solo los Super Administradores pueden gestionar procesos de onboarding');
    }

    return this.onboardingService.listarProcesos(cooperativaId, filtros);
  }

  /**
   * Aprueba o rechaza un proceso
   * Solo SUPER_ADMIN puede aprobar/rechazar solicitudes
   */
  @UseGuards(JwtAuthGuard)
  @RequirePermissions('SYSTEM', 'EXECUTE')
  @Post(':procesoId/decision')
  async aprobarRechazar(
    @Param('cooperativaId') cooperativaId: string,
    @Param('procesoId') procesoId: string,
    @Body() decision: AprobarRechazarDto,
    @GetUser() user: AuthenticatedUser,
  ) {
    // Solo SUPER_ADMIN puede aprobar/rechazar solicitudes de cooperativas
    if (!user.roles.some((r) => r.nombre === 'SUPER_ADMIN')) {
      throw new Error('Solo los Super Administradores pueden aprobar o rechazar solicitudes de cooperativas');
    }

    return this.onboardingService.aprobarRechazar(
      cooperativaId,
      procesoId,
      user.id,
      decision,
    );
  }

  /**
   * Obtiene estadísticas de onboarding
   * Solo SUPER_ADMIN puede ver estadísticas globales
   */
  @UseGuards(JwtAuthGuard)
  @RequirePermissions('SYSTEM', 'READ')
  @Get('estadisticas')
  async obtenerEstadisticas(
    @Param('cooperativaId') cooperativaId: string,
    @GetUser() user: AuthenticatedUser,
  ) {
    // Solo SUPER_ADMIN puede ver estadísticas de onboarding
    if (!user.roles.some((r) => r.nombre === 'SUPER_ADMIN')) {
      throw new Error('Solo los Super Administradores pueden ver estadísticas de onboarding');
    }

    return this.onboardingService.obtenerEstadisticas(cooperativaId);
  }
}