import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ConceptosFacturablesService } from './conceptos-facturables.service';
import { PeriodosFacturablesService } from './periodos-facturables.service';
import { GeneracionFacturasService } from './generacion-facturas.service';
import { ConceptosFacturablesController } from './conceptos-facturables.controller';
import { PeriodosFacturablesController } from './periodos-facturables.controller';
import { GeneracionFacturasController } from './generacion-facturas.controller';
import { Invoice } from './invoice';

@Module({
  imports: [PrismaModule],
  controllers: [
    ConceptosFacturablesController,
    PeriodosFacturablesController,
    GeneracionFacturasController,
  ],
  providers: [
    ConceptosFacturablesService,
    PeriodosFacturablesService,
    GeneracionFacturasService,
    Invoice,
  ],
  exports: [
    ConceptosFacturablesService,
    PeriodosFacturablesService,
    GeneracionFacturasService,
    Invoice,
  ],
})
export class FacturacionModule {}
