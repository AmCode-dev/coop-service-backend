import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma';

@Injectable()
export class CuentasService {
  constructor(private readonly prisma: PrismaService) {}

  public async createNewCuenta(
    cooperativaId: number,
    personaId: string,
    inmuebleId: number,
  ) {
    if (!inmuebleId) {
      throw new Error('No se puede crear una cuenta sin inmueble');
    }
    if (!personaId) {
      throw new Error('No se puede crear una cuenta sin persona');
    }
    if (!cooperativaId) {
      throw new Error('No se puede crear una cuenta sin cooperativa');
    }

    const numeroCuenta = cooperativaId + '-' + Date.now() + '-' + inmuebleId;

    const cuenta = await this.prisma.cuenta.create({
      data: {
        cooperativaId,
        numeroCuenta,
        titularServicioId: personaId,
        inmuebleId,
        observaciones:
          'Cuenta creada por sistema para la cooperativa: ' + cooperativaId,
      },
    });

    return cuenta;
  }
}
