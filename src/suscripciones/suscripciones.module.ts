// ============================================
// MÓDULO PRINCIPAL DEL SISTEMA DE SUSCRIPCIONES
// ============================================

import { Module } from '@nestjs/common';
import { SuscripcionesService } from './services/suscripciones.service';
import { DatosBancariosService } from './services/datos-bancarios.service';
import {
  SuscripcionesController,
  SuscripcionesAdminController,
  SuscripcionesWebhookController,
} from './controllers/suscripciones.controller';

@Module({
  imports: [
    // Aquí se importarían otros módulos necesarios como PrismaModule
  ],
  controllers: [
    SuscripcionesController,
    SuscripcionesAdminController,
    SuscripcionesWebhookController,
  ],
  providers: [
    SuscripcionesService,
    DatosBancariosService,
  ],
  exports: [
    SuscripcionesService,
    DatosBancariosService,
  ],
})
export class SuscripcionesModule {}