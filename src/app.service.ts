import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  getHello(): string {
    return 'Hello World!';
  }

  // Ejemplo de método que usa Prisma
  async getCooperativas() {
    return this.prisma.cooperativa.findMany({
      select: {
        id: true,
        nombre: true,
        razonSocial: true,
        activa: true,
        createdAt: true,
      },
    });
  }

  // Ejemplo de health check de la base de datos
  async healthCheck() {
    return this.prisma.healthCheck();
  }

  // Ejemplo de estadísticas de la base de datos
  async getDatabaseStats() {
    return this.prisma.getDatabaseStats();
  }
}
