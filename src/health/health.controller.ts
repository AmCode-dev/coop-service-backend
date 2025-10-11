import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
    };
  }

  @Get('database')
  async checkDatabase() {
    return this.prisma.healthCheck();
  }

  @Get('stats')
  async getDatabaseStats() {
    return this.prisma.getDatabaseStats();
  }
}
