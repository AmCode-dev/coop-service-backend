import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ProveedoresPagoController } from './controllers/proveedores-pago.controller';
import { ProveedoresPagoService } from './services/proveedores-pago.service';

@Module({
  imports: [PrismaModule],
  controllers: [ProveedoresPagoController],
  providers: [ProveedoresPagoService],
  exports: [ProveedoresPagoService],
})
export class PagosModule {}