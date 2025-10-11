import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Headers,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ConceptosFacturablesService } from './conceptos-facturables.service';
import {
  CreateConceptoFacturableDto,
  UpdateConceptoFacturableDto,
  CreateHistorialConceptoDto,
  UpdateHistorialConceptoDto,
  ConceptoFacturableQueryDto,
} from './dto/concepto-facturable.dto';

@Controller('conceptos-facturables')
export class ConceptosFacturablesController {
  constructor(private readonly conceptosService: ConceptosFacturablesService) {}

  @Post()
  async create(
    @Body() createDto: CreateConceptoFacturableDto,
    @Headers('x-cooperativa-id') cooperativaId: string,
    @Headers('x-usuario-id') usuarioId: string,
  ) {
    return this.conceptosService.create(createDto, cooperativaId, usuarioId);
  }

  @Get()
  async findAll(
    @Headers('x-cooperativa-id') cooperativaId: string,
    @Query() query: ConceptoFacturableQueryDto,
  ) {
    return this.conceptosService.findAll(cooperativaId, query);
  }

  @Get('estadisticas')
  async getEstadisticas(@Headers('x-cooperativa-id') cooperativaId: string) {
    return this.conceptosService.getEstadisticas(cooperativaId);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('x-cooperativa-id') cooperativaId: string,
  ) {
    return this.conceptosService.findOne(id, cooperativaId);
  }

  @Get('codigo/:codigo')
  async findByCodigo(
    @Param('codigo') codigo: string,
    @Headers('x-cooperativa-id') cooperativaId: string,
  ) {
    return this.conceptosService.findByCodigo(codigo, cooperativaId);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateConceptoFacturableDto,
    @Headers('x-cooperativa-id') cooperativaId: string,
  ) {
    return this.conceptosService.update(id, updateDto, cooperativaId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('x-cooperativa-id') cooperativaId: string,
  ) {
    await this.conceptosService.remove(id, cooperativaId);
  }

  // HISTORIAL
  @Post('historial')
  async createHistorial(
    @Body() createDto: CreateHistorialConceptoDto,
    @Headers('x-cooperativa-id') cooperativaId: string,
    @Headers('x-usuario-id') usuarioId: string,
  ) {
    return this.conceptosService.createHistorial(
      createDto,
      cooperativaId,
      usuarioId,
    );
  }

  @Get(':conceptoId/historial')
  async getHistorial(
    @Param('conceptoId', ParseUUIDPipe) conceptoId: string,
    @Headers('x-cooperativa-id') cooperativaId: string,
  ) {
    return this.conceptosService.getHistorial(conceptoId, cooperativaId);
  }

  @Patch('historial/:historialId')
  async updateHistorial(
    @Param('historialId', ParseUUIDPipe) historialId: string,
    @Body() updateDto: UpdateHistorialConceptoDto,
    @Headers('x-cooperativa-id') cooperativaId: string,
  ) {
    return this.conceptosService.updateHistorial(
      historialId,
      updateDto,
      cooperativaId,
    );
  }

  @Delete('historial/:historialId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteHistorial(
    @Param('historialId', ParseUUIDPipe) historialId: string,
    @Headers('x-cooperativa-id') cooperativaId: string,
  ) {
    await this.conceptosService.deleteHistorial(historialId, cooperativaId);
  }

  @Get(':conceptoId/valor-vigente')
  async getValorVigente(
    @Param('conceptoId', ParseUUIDPipe) conceptoId: string,
    @Query('fecha') fecha: string,
    @Headers('x-cooperativa-id') cooperativaId: string,
  ) {
    const fechaConsulta = fecha ? new Date(fecha) : new Date();
    return {
      conceptoId,
      fecha: fechaConsulta,
      valor: await this.conceptosService.getValorVigente(
        conceptoId,
        fechaConsulta,
        cooperativaId,
      ),
    };
  }
}
