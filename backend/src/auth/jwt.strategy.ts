import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';

export interface JwtPayload {
  sub: string;
  email: string;
  orgId: string;
  sessionId: string;
  authVersion: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('auth.accessSecret'),
    });
  }

  async validate(payload: JwtPayload) {
    if (!payload.sub || !payload.orgId || !payload.sessionId) {
      throw new UnauthorizedException({
        code: 'AUTH_INVALID_TOKEN_PAYLOAD',
        message: 'Invalid access token payload format.',
      });
    }

    // Verify session in database
    const session = await this.prisma.runInSystemContext(async (tx) => {
      return tx.userSession.findUnique({
        where: { id: payload.sessionId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
              organizationId: true,
              status: true,
              authVersion: true,
            },
          },
        },
      });
    });

    if (!session || session.status !== 'ACTIVE' || session.expiresAt < new Date()) {
      throw new UnauthorizedException({
        code: 'AUTH_SESSION_REVOKED_OR_EXPIRED',
        message: 'Your user session has been revoked or expired.',
      });
    }

    // Check user status and immediate revocation auth_version kill-switch
    if (!session.user || session.user.status !== 'ACTIVE') {
      throw new UnauthorizedException({
        code: 'AUTH_USER_DISABLED',
        message: 'This user account is currently disabled or inactive.',
      });
    }

    if (session.user.authVersion !== payload.authVersion) {
      throw new UnauthorizedException({
        code: 'AUTH_VERSION_MISMATCH',
        message: 'Token invalidated due to password change or administrative privilege reset.',
      });
    }

    return {
      id: session.user.id,
      userId: session.user.id,
      email: session.user.email,
      fullName: session.user.fullName,
      organizationId: session.organizationId,
      sessionId: session.id,
      authVersion: session.user.authVersion,
    };
  }
}
