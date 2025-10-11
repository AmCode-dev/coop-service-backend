import { Module } from '@nestjs/common';
import { MedidoresService } from './medidores.service';
import { MedidoresController } from './controllers/medidores.controller';

@Module({
  controllers: [MedidoresController],
  providers: [MedidoresService],
  exports: [MedidoresService],
})
export class MedidoresModule {}
