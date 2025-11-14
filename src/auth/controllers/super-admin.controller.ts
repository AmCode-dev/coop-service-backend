import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SuperAdminService } from '../services/super-admin.service';
import { SuperAdminGuard } from '../guards/super-admin.guard';
import { RequireSuperAdmin } from '../decorators/auth.decorators';

@Controller('super-admin')
@UseGuards(SuperAdminGuard)
@RequireSuperAdmin()
export class SuperAdminController {
  constructor(private readonly superAdminService: SuperAdminService) {}

  @Get('cooperativas')
  async getAllCooperativas() {
    return this.superAdminService.getAllCooperativas();
  }

  @Get('cooperativas/:id')
  async getCooperativaById(@Param('id') id: string) {
    const parsedId = parseInt(id + '');
    return this.superAdminService.getCooperativaById(parsedId);
  }

  @Get('estadisticas')
  async getEstadisticasGlobales() {
    return this.superAdminService.getEstadisticasGlobales();
  }

  @Get('buscar')
  async buscarGlobal(@Query('termino') termino: string) {
    return this.superAdminService.buscarGlobal(termino);
  }

  @Patch('cooperativas/:id/estado')
  async cambiarEstadoCooperativa(
    @Param('id') id: string,
    @Body('activa') activa: boolean,
  ) {
    const parsedId = parseInt(id + '');
    return this.superAdminService.cambiarEstadoCooperativa(parsedId, activa);
  }
}
