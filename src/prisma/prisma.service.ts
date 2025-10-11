import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '../../generated/prisma';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      // Configuraciones de conexión
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
      // Configuraciones de logging en desarrollo
      log:
        process.env.NODE_ENV === 'development'
          ? ['query', 'error', 'warn']
          : ['error'],
      // Configuraciones adicionales
      errorFormat: 'pretty',
    });
  }

  async onModuleInit() {
    // Conectar a la base de datos
    await this.$connect();
    console.log('✅ Conexión a la base de datos establecida');
  }

  async onModuleDestroy() {
    // Desconectar de la base de datos al cerrar la aplicación
    await this.$disconnect();
    console.log('🔌 Conexión a la base de datos cerrada');
  }

  /**
   * Ejecuta una operación dentro de una transacción
   * @param fn Función que contiene las operaciones de la transacción
   * @returns Resultado de la transacción
   */
  async executeTransaction<T>(
    fn: (prisma: Omit<PrismaService, 'executeTransaction'>) => Promise<T>,
  ): Promise<T> {
    return this.$transaction(fn);
  }

  /**
   * Limpia todas las tablas (útil para testing)
   * ⚠️ USAR SOLO EN DESARROLLO/TESTING
   */
  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('No se puede limpiar la base de datos en producción');
    }

    const tablenames = await this.$queryRaw<
      Array<{ tablename: string }>
    >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

    const tables = tablenames
      .map(({ tablename }) => tablename)
      .filter((name) => name !== '_prisma_migrations')
      .map((name) => `"public"."${name}"`)
      .join(', ');

    try {
      await this.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
    } catch (error: unknown) {
      console.error('Error al limpiar la base de datos:', error);
    }
  }

  /**
   * Verifica el estado de la conexión a la base de datos
   */
  async healthCheck(): Promise<{ status: string; timestamp: Date }> {
    try {
      await this.$queryRaw`SELECT 1`;
      return {
        status: 'healthy',
        timestamp: new Date(),
      };
    } catch {
      return {
        status: 'unhealthy',
        timestamp: new Date(),
      };
    }
  }

  /**
   * Obtiene estadísticas de la base de datos
   */
  async getDatabaseStats() {
    const stats = await this.$queryRaw<
      Array<{
        table_name: string;
        row_count: bigint;
        table_size: string;
      }>
    >`
      SELECT 
        schemaname,
        tablename as table_name,
        n_tup_ins - n_tup_del as row_count,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as table_size
      FROM pg_stat_user_tables 
      WHERE schemaname = 'public'
      ORDER BY n_tup_ins - n_tup_del DESC;
    `;

    return stats.map((stat) => ({
      ...stat,
      row_count: Number(stat.row_count),
    }));
  }
}
