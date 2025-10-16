import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { CooperativasModule } from './cooperativas/cooperativas.module';
import { InmueblesModule } from './inmuebles/inmuebles.module';
import { MedidoresModule } from './medidores/medidores.module';
import { PersonasModule } from './personas/personas.module';
import { MailerModule } from './mailer/mailer.module';

@Module({
  imports: [
    PrismaModule,
    HealthModule,
    AuthModule,
    CooperativasModule,
    InmueblesModule,
    MedidoresModule,
    PersonasModule,
    MailerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
