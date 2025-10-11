import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';
import type { SessionInfo } from '../interfaces/auth.interface';

@Injectable()
export class RefreshTokenService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Genera un nuevo refresh token para un usuario
   */
  async generateRefreshToken(usuarioId: string, sessionInfo: SessionInfo) {
    const token = this.generateSecureToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 días

    return await this.prisma.refreshToken.create({
      data: {
        token,
        usuarioId,
        expiresAt,
        userAgent: sessionInfo.userAgent,
        ipAddress: sessionInfo.ipAddress,
        deviceId: sessionInfo.deviceId,
      },
    });
  }

  /**
   * Valida y retorna un refresh token si es válido
   */
  async validateRefreshToken(token: string) {
    const refreshToken = await this.prisma.refreshToken.findUnique({
      where: { token },
      include: {
        usuario: {
          include: {
            cooperativas: {
              select: {
                id: true,
                cooperativa: {
                  select: {
                    id: true,
                    nombre: true,
                    activa: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!refreshToken) {
      return null;
    }

    // Verificar si el token está revocado
    if (refreshToken.isRevoked) {
      return null;
    }

    // Verificar si el token ha expirado
    if (refreshToken.expiresAt < new Date()) {
      // Marcar como revocado si ya expiró
      await this.revokeRefreshToken(refreshToken.id);
      return null;
    }

    // Verificar si el usuario y cooperativa están activos
    if (
      !refreshToken.usuario.activo ||
      !refreshToken.usuario.cooperativas.some((c) => c.cooperativa.activa)
    ) {
      await this.revokeRefreshToken(refreshToken.id);
      return null;
    }

    // Actualizar estadísticas de uso
    await this.updateTokenUsage(refreshToken.id);

    return refreshToken;
  }

  /**
   * Rota un refresh token: revoca el actual y genera uno nuevo
   */
  async rotateRefreshToken(oldToken: string, sessionInfo: SessionInfo) {
    const existingToken = await this.validateRefreshToken(oldToken);

    if (!existingToken) {
      return null;
    }

    // Crear nuevo token
    const newToken = await this.generateRefreshToken(
      existingToken.usuarioId,
      sessionInfo,
    );

    // Revocar el token anterior y establecer la relación de reemplazo
    await this.prisma.refreshToken.update({
      where: { id: existingToken.id },
      data: {
        isRevoked: true,
        replacedByTokenId: newToken.id,
      },
    });

    return newToken;
  }

  /**
   * Revoca un refresh token específico
   */
  async revokeRefreshToken(tokenId: string): Promise<void> {
    await this.prisma.refreshToken.update({
      where: { id: tokenId },
      data: { isRevoked: true },
    });
  }

  /**
   * Revoca todos los refresh tokens de un usuario
   */
  async revokeAllUserTokens(usuarioId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: {
        usuarioId,
        isRevoked: false,
      },
      data: { isRevoked: true },
    });
  }

  /**
   * Revoca un token específico por su valor
   */
  async revokeTokenByValue(token: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { token },
      data: { isRevoked: true },
    });
  }

  /**
   * Limpia tokens expirados (para ejecutar periódicamente)
   */
  async cleanExpiredTokens(): Promise<number> {
    const result = await this.prisma.refreshToken.deleteMany({
      where: {
        OR: [{ expiresAt: { lt: new Date() } }, { isRevoked: true }],
      },
    });

    return result.count;
  }

  /**
   * Obtiene los tokens activos de un usuario con información de sesión
   */
  async getUserActiveSessions(usuarioId: string) {
    return await this.prisma.refreshToken.findMany({
      where: {
        usuarioId,
        isRevoked: false,
        expiresAt: { gt: new Date() },
      },
      select: {
        id: true,
        userAgent: true,
        ipAddress: true,
        deviceId: true,
        lastUsedAt: true,
        createdAt: true,
        expiresAt: true,
        usageCount: true,
      },
      orderBy: { lastUsedAt: 'desc' },
    });
  }

  /**
   * Revoca una sesión específica de un usuario
   */
  async revokeUserSession(
    usuarioId: string,
    tokenId: string,
  ): Promise<boolean> {
    const result = await this.prisma.refreshToken.updateMany({
      where: {
        id: tokenId,
        usuarioId,
        isRevoked: false,
      },
      data: { isRevoked: true },
    });

    return result.count > 0;
  }

  /**
   * Actualiza las estadísticas de uso de un token
   */
  private async updateTokenUsage(tokenId: string): Promise<void> {
    await this.prisma.refreshToken.update({
      where: { id: tokenId },
      data: {
        lastUsedAt: new Date(),
        usageCount: { increment: 1 },
      },
    });
  }

  /**
   * Genera un token seguro
   */
  private generateSecureToken(): string {
    return crypto.randomBytes(64).toString('hex');
  }

  /**
   * Obtiene estadísticas de tokens para monitoreo
   */
  async getTokenStats() {
    const [total, active, expired, revoked] = await Promise.all([
      this.prisma.refreshToken.count(),
      this.prisma.refreshToken.count({
        where: {
          isRevoked: false,
          expiresAt: { gt: new Date() },
        },
      }),
      this.prisma.refreshToken.count({
        where: {
          isRevoked: false,
          expiresAt: { lt: new Date() },
        },
      }),
      this.prisma.refreshToken.count({
        where: { isRevoked: true },
      }),
    ]);

    return {
      total,
      active,
      expired,
      revoked,
      timestamp: new Date().toISOString(),
    };
  }
}
