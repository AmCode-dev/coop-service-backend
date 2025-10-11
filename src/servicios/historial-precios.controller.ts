import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Headers,
} from '@nestjs/common';
import { HistorialPreciosService } from './historial-precios.service';
import {
  CreateHistorialPrecioDto,
  UpdateHistorialPrecioDto,
  BuscarPreciosDto,
} from './dto/historial-precio.dto';

@Controller('historial-precios')
export class HistorialPreciosController {
  constructor(private readonly historialPreciosService: HistorialPreciosService) {}

  @Post()
  create(
    @Body() createHistorialPrecioDto: CreateHistorialPrecioDto,
    @Headers('x-cooperativa-id') cooperativaId: string,
    @Headers('x-usuario-id') usuarioId: string,
  ) {
    return this.historialPreciosService.create(
      createHistorialPrecioDto,
      cooperativaId,
      usuarioId,
    );
  }

  @Get('categoria/:categoriaId')
  findAllByCategoria(
    @Param('categoriaId') categoriaId: string,
    @Headers('x-cooperativa-id') cooperativaId: string,
    @Query() buscarPreciosDto?: BuscarPreciosDto,
  ) {
    return this.historialPreciosService.findAllByCategoria(
      categoriaId,
      cooperativaId,
      buscarPreciosDto,
    );
  }

  @Get('categoria/:categoriaId/vigente')
  findPrecioVigente(
    @Param('categoriaId') categoriaId: string,
    @Headers('x-cooperativa-id') cooperativaId: string,
    @Query('fecha') fecha?: string,
  ) {
    const fechaConsulta = fecha ? new Date(fecha) : undefined;
    return this.historialPreciosService.findPrecioVigente(
      categoriaId,
      cooperativaId,
      fechaConsulta,
    );
  }

  @Get('categoria/:categoriaId/ultimo')
  findUltimoPrecio(
    @Param('categoriaId') categoriaId: string,
    @Headers('x-cooperativa-id') cooperativaId: string,
  ) {
    return this.historialPreciosService.findUltimoPrecio(categoriaId, cooperativaId);
  }

  @Get('categoria/:categoriaId/evolucion')
  getEvolucionPrecios(
    @Param('categoriaId') categoriaId: string,
    @Headers('x-cooperativa-id') cooperativaId: string,
  ) {
    return this.historialPreciosService.getEvolucionPrecios(categoriaId, cooperativaId);
  }

  @Get('comparacion')
  getComparacionPrecios(
    @Headers('x-cooperativa-id') cooperativaId: string,
    @Query('fecha') fecha?: string,
  ) {
    const fechaConsulta = fecha ? new Date(fecha) : undefined;
    return this.historialPreciosService.getComparacionPrecios(
      cooperativaId,
      fechaConsulta,
    );
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateHistorialPrecioDto: UpdateHistorialPrecioDto,
    @Headers('x-cooperativa-id') cooperativaId: string,
  ) {
    return this.historialPreciosService.update(
      id,
      updateHistorialPrecioDto,
      cooperativaId,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Headers('x-cooperativa-id') cooperativaId: string) {
    return this.historialPreciosService.remove(id, cooperativaId);
  }
}