import {
  Controller,
  Post,
  Delete,
  Get,
  Body,
  Param,
  Headers,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { GeneracionFacturasService } from './generacion-facturas.service';
import {
  GenerarFacturasPeriodoDto,
  GenerarFacturaIndividualDto,
  ResumenGeneracionFacturasDto,
} from './dto/generar-facturas.dto';

@Controller('generar-facturas')
export class GeneracionFacturasController {
  constructor(private readonly generacionService: GeneracionFacturasService) {}

  @Post('periodo')
  async generarFacturasPeriodo(
    @Body() dto: GenerarFacturasPeriodoDto,
    @Headers('x-cooperativa-id') cooperativaId: string,
    @Headers('x-usuario-id') usuarioId: string,
  ) {
    return this.generacionService.generarFacturasPeriodo(
      dto,
      cooperativaId,
      usuarioId,
    );
  }

  @Post('individual')
  async generarFacturaIndividual(
    @Body() dto: GenerarFacturaIndividualDto,
    @Headers('x-cooperativa-id') cooperativaId: string,
    @Headers('x-usuario-id') usuarioId: string,
  ) {
    const resultado = await this.generacionService.generarFacturaIndividual(
      dto,
      cooperativaId,
      usuarioId,
    );
    return resultado.factura;
  }

  @Post('preview')
  async previewFacturas(
    @Body() dto: ResumenGeneracionFacturasDto,
    @Headers('x-cooperativa-id') cooperativaId: string,
  ) {
    return this.generacionService.previewFacturas(dto, cooperativaId);
  }

  @Get('periodo/:periodoId/preview')
  async previewFacturasPeriodo(
    @Param('periodoId', ParseUUIDPipe) periodoId: string,
    @Headers('x-cooperativa-id') cooperativaId: string,
  ) {
    return this.generacionService.previewFacturas({ periodoId }, cooperativaId);
  }

  @Get('periodo/:periodoId/preview/cuenta/:cuentaId')
  async previewFacturaIndividual(
    @Param('periodoId', ParseUUIDPipe) periodoId: string,
    @Param('cuentaId', ParseUUIDPipe) cuentaId: string,
    @Headers('x-cooperativa-id') cooperativaId: string,
  ) {
    const previews = await this.generacionService.previewFacturas(
      { periodoId, cuentasEspecificas: [cuentaId] },
      cooperativaId,
    );

    if (previews.length === 0) {
      return null;
    }

    return previews[0];
  }

  @Delete('periodo/:periodoId')
  @HttpCode(HttpStatus.OK)
  async eliminarFacturasPeriodo(
    @Param('periodoId', ParseUUIDPipe) periodoId: string,
    @Headers('x-cooperativa-id') cooperativaId: string,
    @Headers('x-usuario-id') usuarioId: string,
  ) {
    return this.generacionService.eliminarFacturasPeriodo(
      periodoId,
      cooperativaId,
      usuarioId,
    );
  }
}
