import { Module } from '@nestjs/common';
import { PersonasController } from './controllers/personas.controller';
import { PersonasService } from './personas.service';
import { ConsumoSocioSimpleController } from './controllers/consumo-socio-simple.controller';

@Module({
  controllers: [PersonasController, ConsumoSocioSimpleController],
  providers: [PersonasService],
  exports: [PersonasService],
})
export class PersonasModule {}
