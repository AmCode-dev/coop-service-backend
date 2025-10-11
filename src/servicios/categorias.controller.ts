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
import { CategoriasService } from './categorias.service';
import { CreateCategoriaDto, UpdateCategoriaDto } from './dto/categoria.dto';

@Controller('categorias')
export class CategoriasController {
  constructor(private readonly categoriasService: CategoriasService) {}

  @Post()
  create(
    @Body() createCategoriaDto: CreateCategoriaDto,
    @Headers('x-cooperativa-id') cooperativaId: string,
    @Headers('x-usuario-id') usuarioId: string,
  ) {
    return this.categoriasService.create(createCategoriaDto, cooperativaId, usuarioId);
  }

  @Get()
  findAll(
    @Headers('x-cooperativa-id') cooperativaId: string,
    @Query('includeInactive') includeInactive?: string,
  ) {
    return this.categoriasService.findAll(cooperativaId, includeInactive === 'true');
  }

  @Get('servicio/:servicioId')
  findAllByServicio(
    @Param('servicioId') servicioId: string,
    @Headers('x-cooperativa-id') cooperativaId: string,
    @Query('includeInactive') includeInactive?: string,
  ) {
    return this.categoriasService.findAllByServicio(
      servicioId,
      cooperativaId,
      includeInactive === 'true',
    );
  }

  @Get('servicio/:servicioId/estadisticas')
  getEstadisticasPorServicio(
    @Param('servicioId') servicioId: string,
    @Headers('x-cooperativa-id') cooperativaId: string,
  ) {
    return this.categoriasService.getEstadisticasPorServicio(servicioId, cooperativaId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Headers('x-cooperativa-id') cooperativaId: string) {
    return this.categoriasService.findOne(id, cooperativaId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCategoriaDto: UpdateCategoriaDto,
    @Headers('x-cooperativa-id') cooperativaId: string,
  ) {
    return this.categoriasService.update(id, updateCategoriaDto, cooperativaId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Headers('x-cooperativa-id') cooperativaId: string) {
    return this.categoriasService.remove(id, cooperativaId);
  }

  @Get('servicio/:servicioId/codigo/:codigo')
  findByCode(
    @Param('servicioId') servicioId: string,
    @Param('codigo') codigo: string,
    @Headers('x-cooperativa-id') cooperativaId: string,
  ) {
    return this.categoriasService.findByCode(codigo, servicioId, cooperativaId);
  }
}