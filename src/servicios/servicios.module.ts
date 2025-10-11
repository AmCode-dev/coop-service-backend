import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ServiciosService } from './servicios.service';
import { CategoriasService } from './categorias.service';
import { HistorialPreciosService } from './historial-precios.service';
import { ServiciosController } from './servicios.controller';
import { CategoriasController } from './categorias.controller';
import { HistorialPreciosController } from './historial-precios.controller';

@Module({
  imports: [PrismaModule],
  controllers: [
    ServiciosController,
    CategoriasController,
    HistorialPreciosController,
  ],
  providers: [ServiciosService, CategoriasService, HistorialPreciosService],
  exports: [ServiciosService, CategoriasService, HistorialPreciosService],
})
export class ServiciosModule {}