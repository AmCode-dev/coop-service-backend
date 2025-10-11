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
import { ServiciosService } from './servicios.service';
import { CreateServicioDto, UpdateServicioDto } from './dto/servicio.dto';

@Controller('servicios')
export class ServiciosController {
  constructor(private readonly serviciosService: ServiciosService) {}

  @Post()
  create(
    @Body() createServicioDto: CreateServicioDto,
    @Headers('x-cooperativa-id') cooperativaId: string,
    @Headers('x-usuario-id') usuarioId: string,
  ) {
    return this.serviciosService.create(createServicioDto, cooperativaId, usuarioId);
  }

  @Get()
  findAll(
    @Headers('x-cooperativa-id') cooperativaId: string,
    @Query('includeInactive') includeInactive?: string,
  ) {
    return this.serviciosService.findAll(cooperativaId, includeInactive === 'true');
  }

  @Get('estadisticas')
  getEstadisticas(@Headers('x-cooperativa-id') cooperativaId: string) {
    return this.serviciosService.getEstadisticas(cooperativaId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Headers('x-cooperativa-id') cooperativaId: string) {
    return this.serviciosService.findOne(id, cooperativaId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateServicioDto: UpdateServicioDto,
    @Headers('x-cooperativa-id') cooperativaId: string,
  ) {
    return this.serviciosService.update(id, updateServicioDto, cooperativaId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Headers('x-cooperativa-id') cooperativaId: string) {
    return this.serviciosService.remove(id, cooperativaId);
  }

  @Get('codigo/:codigo')
  findByCode(
    @Param('codigo') codigo: string,
    @Headers('x-cooperativa-id') cooperativaId: string,
  ) {
    return this.serviciosService.findByCode(codigo, cooperativaId);
  }
}