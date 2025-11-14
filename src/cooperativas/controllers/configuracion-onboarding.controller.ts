import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ConfiguracionOnboardingService } from '../services/configuracion-onboarding.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RequirePermissions } from '../../auth/decorators/auth.decorators';
import { GetUser } from '../../auth/decorators/user.decorators';
import type { AuthenticatedUser } from '../../auth/interfaces/auth.interface';

@Controller('cooperativas/:cooperativaId/onboarding/configuracion')
@UseGuards(JwtAuthGuard)
export class ConfiguracionOnboardingController {
  constructor(
    private readonly configuracionService: ConfiguracionOnboardingService,
  ) {}

  /**
   * Obtiene la configuración de onboarding
   * Solo SUPER_ADMIN puede acceder
   */
  @Get()
  @RequirePermissions('SYSTEM', 'READ')
  async obtenerConfiguracion(
    @Param('cooperativaId') cooperativaId: string,
    @GetUser() user: AuthenticatedUser,
  ) {
    const parseredCooperativaId = parseInt(cooperativaId);
    // Solo SUPER_ADMIN puede gestionar configuraciones de onboarding
    if (!user.roles.some((r) => r.nombre === 'SUPER_ADMIN')) {
      throw new Error(
        'Solo los Super Administradores pueden gestionar configuraciones de onboarding',
      );
    }

    return this.configuracionService.obtenerConfiguracion(
      parseredCooperativaId,
    );
  }

  /**
   * Actualiza la configuración de onboarding
   * Solo SUPER_ADMIN puede modificar
   */
  @Put()
  @RequirePermissions('SYSTEM', 'UPDATE')
  async actualizarConfiguracion(
    @Param('cooperativaId') cooperativaId: string,
    @Body() datos: any,
    @GetUser() user: AuthenticatedUser,
  ) {
    // Solo SUPER_ADMIN puede gestionar configuraciones de onboarding
    if (!user.roles.some((r) => r.nombre === 'SUPER_ADMIN')) {
      throw new Error(
        'Solo los Super Administradores pueden modificar configuraciones de onboarding',
      );
    }

    const parseredCooperativaId = parseInt(cooperativaId);
    return this.configuracionService.actualizarConfiguracion(
      parseredCooperativaId,
      datos,
    );
  } /**
   * Obtiene todas las reglas de onboarding
   * Solo SUPER_ADMIN puede acceder
   */
  @Get('reglas')
  @RequirePermissions('SYSTEM', 'READ')
  async obtenerReglas(
    @Param('cooperativaId') cooperativaId: string,
    @GetUser() user: AuthenticatedUser,
  ) {
    const parseredCooperativaId = parseInt(cooperativaId);
    // Solo SUPER_ADMIN puede gestionar configuraciones de onboarding
    if (!user.roles.some((r) => r.nombre === 'SUPER_ADMIN')) {
      throw new Error(
        'Solo los Super Administradores pueden gestionar reglas de onboarding',
      );
    }

    return this.configuracionService.obtenerReglas(parseredCooperativaId);
  }

  /**
   * Crea una nueva regla de onboarding
   * Solo SUPER_ADMIN puede crear
   */
  @Post('reglas')
  @RequirePermissions('SYSTEM', 'CREATE')
  async crearRegla(
    @Param('cooperativaId') cooperativaId: string,
    @Body() datos: any,
    @GetUser() user: AuthenticatedUser,
  ) {
    const parseredCooperativaId = parseInt(cooperativaId);
    // Solo SUPER_ADMIN puede gestionar configuraciones de onboarding
    if (!user.roles.some((r) => r.nombre === 'SUPER_ADMIN')) {
      throw new Error(
        'Solo los Super Administradores pueden crear reglas de onboarding',
      );
    }

    return this.configuracionService.crearRegla(parseredCooperativaId, datos);
  }

  /**
   * Obtiene una regla específica
   * Solo SUPER_ADMIN puede acceder
   */
  @Get('reglas/:reglaId')
  @RequirePermissions('SYSTEM', 'READ')
  async obtenerRegla(
    @Param('cooperativaId') cooperativaId: string,
    @Param('reglaId') reglaId: string,
    @GetUser() user: AuthenticatedUser,
  ) {
    const parseredCooperativaId = parseInt(cooperativaId);
    // Solo SUPER_ADMIN puede gestionar configuraciones de onboarding
    if (!user.roles.some((r) => r.nombre === 'SUPER_ADMIN')) {
      throw new Error(
        'Solo los Super Administradores pueden gestionar reglas de onboarding',
      );
    }

    return this.configuracionService.obtenerRegla(
      reglaId,
      parseredCooperativaId,
    );
  }

  /**
   * Actualiza una regla de onboarding
   * Solo SUPER_ADMIN puede modificar
   */
  @Put('reglas/:reglaId')
  @RequirePermissions('SYSTEM', 'UPDATE')
  async actualizarRegla(
    @Param('cooperativaId') cooperativaId: string,
    @Param('reglaId') reglaId: string,
    @Body() datos: any,
    @GetUser() user: AuthenticatedUser,
  ) {
    // Solo SUPER_ADMIN puede gestionar configuraciones de onboarding
    if (!user.roles.some((r) => r.nombre === 'SUPER_ADMIN')) {
      throw new Error(
        'Solo los Super Administradores pueden modificar reglas de onboarding',
      );
    }
    const parseredCooperativaId = parseInt(cooperativaId);
    return this.configuracionService.actualizarRegla(
      reglaId,
      parseredCooperativaId,
      datos,
    );
  }

  /**
   * Elimina una regla de onboarding
   * Solo SUPER_ADMIN puede eliminar
   */
  @Delete('reglas/:reglaId')
  @RequirePermissions('SYSTEM', 'DELETE')
  async eliminarRegla(
    @Param('cooperativaId') cooperativaId: string,
    @Param('reglaId') reglaId: string,
    @GetUser() user: AuthenticatedUser,
  ) {
    const parseredCooperativaId = parseInt(cooperativaId);
    // Solo SUPER_ADMIN puede gestionar configuraciones de onboarding
    if (!user.roles.some((r) => r.nombre === 'SUPER_ADMIN')) {
      throw new Error(
        'Solo los Super Administradores pueden eliminar reglas de onboarding',
      );
    }

    return this.configuracionService.eliminarRegla(
      reglaId,
      parseredCooperativaId,
    );
  }

  /**
   * Reordena las reglas de onboarding
   * Solo SUPER_ADMIN puede reordenar
   */
  @Put('reglas/orden')
  @RequirePermissions('SYSTEM', 'UPDATE')
  async reordenarReglas(
    @Param('cooperativaId') cooperativaId: string,
    @Body() datos: { ordenes: Array<{ id: string; orden: number }> },
    @GetUser() user: AuthenticatedUser,
  ) {
    const parseredCooperativaId = parseInt(cooperativaId);
    // Solo SUPER_ADMIN puede gestionar configuraciones de onboarding
    if (!user.roles.some((r) => r.nombre === 'SUPER_ADMIN')) {
      throw new Error(
        'Solo los Super Administradores pueden reordenar reglas de onboarding',
      );
    }

    return this.configuracionService.reordenarReglas(
      parseredCooperativaId,
      datos.ordenes,
    );
  }

  /**
   * Obtiene estadísticas de configuración
   * Solo SUPER_ADMIN puede acceder
   */
  @Get('estadisticas')
  @RequirePermissions('SYSTEM', 'READ')
  async obtenerEstadisticas(
    @Param('cooperativaId') cooperativaId: string,
    @GetUser() user: AuthenticatedUser,
  ) {
    const parseredCooperativaId = parseInt(cooperativaId);
    // Solo SUPER_ADMIN puede gestionar configuraciones de onboarding
    if (!user.roles.some((r) => r.nombre === 'SUPER_ADMIN')) {
      throw new Error(
        'Solo los Super Administradores pueden ver estadísticas de onboarding',
      );
    }

    return this.configuracionService.obtenerEstadisticas(parseredCooperativaId);
  }
}
