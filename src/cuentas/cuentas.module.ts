import { Module } from '@nestjs/common';
import { CuentasService } from './cuentas.service';
import { PrismaModule } from 'src/prisma';

@Module({
  imports: [PrismaModule],
  providers: [CuentasService],
})
export class CuentasModule {}
