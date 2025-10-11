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
import { PeriodosFacturablesService } from './periodos-facturables.service';
import {
  CreatePeriodoFacturableDto,
  UpdatePeriodoFacturableDto,
  CreateConceptoFacturableAplicadoDto,
  UpdateConceptoFacturableAplicadoDto,
  PeriodoFacturableQueryDto,
  ConceptoAplicadoQueryDto,
  BulkCreateConceptosAplicadosDto,
  CalcularFacturacionDto,
} from './dto/periodo-facturable.dto';

@Controller('periodos-facturables')
export class PeriodosFacturablesController {
  constructor(private readonly periodosService: PeriodosFacturablesService) {}

  @Post()
  async create(
    @Body() createDto: CreatePeriodoFacturableDto,
    @Headers('x-cooperativa-id') cooperativaId: string,
    @Headers('x-usuario-id') usuarioId: string,
  ) {
    return this.periodosService.create(createDto, cooperativaId, usuarioId);
  }

  @Get()
  async findAll(
    @Headers('x-cooperativa-id') cooperativaId: string,
    @Query() query: PeriodoFacturableQueryDto,
  ) {
    return this.periodosService.findAll(cooperativaId, query);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('x-cooperativa-id') cooperativaId: string,
  ) {
    return this.periodosService.findOne(id, cooperativaId);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdatePeriodoFacturableDto,
    @Headers('x-cooperativa-id') cooperativaId: string,
    @Headers('x-usuario-id') usuarioId: string,
  ) {
    return this.periodosService.update(id, updateDto, cooperativaId, usuarioId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('x-cooperativa-id') cooperativaId: string,
  ) {
    await this.periodosService.remove(id, cooperativaId);
  }

  // CONCEPTOS APLICADOS
  @Post('conceptos-aplicados')
  async createConceptoAplicado(
    @Body() createDto: CreateConceptoFacturableAplicadoDto,
    @Headers('x-cooperativa-id') cooperativaId: string,
    @Headers('x-usuario-id') usuarioId: string,
  ) {
    return this.periodosService.createConceptoAplicado(
      createDto,
      cooperativaId,
      usuarioId,
    );
  }

  @Get('conceptos-aplicados')
  async findConceptosAplicados(
    @Headers('x-cooperativa-id') cooperativaId: string,
    @Query() query: ConceptoAplicadoQueryDto,
  ) {
    return this.periodosService.findConceptosAplicados(cooperativaId, query);
  }

  @Patch('conceptos-aplicados/:id')
  async updateConceptoAplicado(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateConceptoFacturableAplicadoDto,
    @Headers('x-cooperativa-id') cooperativaId: string,
  ) {
    return this.periodosService.updateConceptoAplicado(
      id,
      updateDto,
      cooperativaId,
    );
  }

  @Delete('conceptos-aplicados/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeConceptoAplicado(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('x-cooperativa-id') cooperativaId: string,
  ) {
    await this.periodosService.removeConceptoAplicado(id, cooperativaId);
  }

  // OPERACIONES MASIVAS
  @Post('conceptos-aplicados/bulk')
  async bulkCreateConceptosAplicados(
    @Body() bulkDto: BulkCreateConceptosAplicadosDto,
    @Headers('x-cooperativa-id') cooperativaId: string,
    @Headers('x-usuario-id') usuarioId: string,
  ) {
    return this.periodosService.bulkCreateConceptosAplicados(
      bulkDto,
      cooperativaId,
      usuarioId,
    );
  }

  // ANÁLISIS
  @Post('calcular-facturacion')
  async calcularResumenFacturacion(
    @Body() calcularDto: CalcularFacturacionDto,
    @Headers('x-cooperativa-id') cooperativaId: string,
  ) {
    return this.periodosService.calcularResumenFacturacion(
      calcularDto,
      cooperativaId,
    );
  }

  @Get(':id/resumen')
  async getResumenPeriodo(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('x-cooperativa-id') cooperativaId: string,
  ) {
    return this.periodosService.calcularResumenFacturacion(
      { periodoId: id },
      cooperativaId,
    );
  }

  @Get(':id/resumen/cuenta/:cuentaId')
  async getResumenPeriodoCuenta(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('cuentaId', ParseUUIDPipe) cuentaId: string,
    @Headers('x-cooperativa-id') cooperativaId: string,
  ) {
    return this.periodosService.calcularResumenFacturacion(
      { periodoId: id, cuentaId },
      cooperativaId,
    );
  }
}
