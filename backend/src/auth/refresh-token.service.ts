import {
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CryptoService } from './crypto.service';

export interface RotationResult {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    organizationId: string;
  };
  fromIdempotentRecovery?: boolean;
}

@Injectable()
export class RefreshTokenService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cryptoService: CryptoService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Rotates a refresh token with strict token-family replay detection and 30s AES-256-GCM idempotent recovery.
   */
  async rotate(
    plaintextToken: string,
    idempotencyKey?: string,
    endpoint: string = '/api/v1/auth/refresh',
  ): Promise<RotationResult> {
    if (!plaintextToken) {
      throw new UnauthorizedException({
        code: 'AUTH_REFRESH_TOKEN_REQUIRED',
        message: 'No refresh token provided in cookie or request body.',
      });
    }

    const incomingHash = this.cryptoService.hashToken(plaintextToken);

    // 1. Find token record in database in system context
    const tokenRecord = await this.prisma.runInSystemContext(async (tx) => {
      return tx.refreshTokenRecord.findUnique({
        where: { tokenHash: incomingHash },
        include: {
          session: {
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
          },
          tokenFamily: true,
        },
      });
    });

    if (!tokenRecord) {
      throw new UnauthorizedException({
        code: 'AUTH_INVALID_REFRESH_TOKEN',
        message: 'The provided refresh token does not exist or has invalid signature.',
      });
    }

    const { session, tokenFamily } = tokenRecord;

    // 2. Step 1 of Idempotency: Check if an idempotent retry is being attempted
    if (idempotencyKey) {
      const existingIdempotency = await this.prisma.runInSystemContext(async (tx) => {
        return tx.authIdempotencyRecord.findUnique({
          where: {
            uq_auth_idempotency_session_key: {
              sessionId: session.id,
              idempotencyKey,
            },
          },
        });
      });

      if (existingIdempotency) {
        // Step 2: Validate binding fields
        if (existingIdempotency.expiresAt < new Date()) {
          throw new UnauthorizedException({
            code: 'AUTH_RECOVERY_WINDOW_EXPIRED',
            message: 'The 30-second idempotent recovery window for this refresh request has expired.',
          });
        }

        if (existingIdempotency.requestTokenHash !== incomingHash) {
          throw new UnprocessableEntityException({
            code: 'AUTH_IDEMPOTENCY_PAYLOAD_MISMATCH',
            message: 'Idempotency key has already been used with a different refresh token in this session.',
          });
        }

        // Decrypt cached response envelope
        const decryptedPayload = this.cryptoService.decryptResponseEnvelope(
          Buffer.from(existingIdempotency.encryptedEnvelope),
          Buffer.from(existingIdempotency.nonce),
          Buffer.from(existingIdempotency.authTag),
          {
            keyId: existingIdempotency.keyId,
            sessionId: existingIdempotency.sessionId,
            tokenFamilyId: existingIdempotency.tokenFamilyId,
            endpoint: existingIdempotency.endpoint,
            statusCode: existingIdempotency.responseStatusCode,
          },
        );

        return {
          ...decryptedPayload,
          fromIdempotentRecovery: true,
        };
      }
    }

    // 3. Verify session & family status
    if (session.status !== 'ACTIVE' || session.expiresAt < new Date()) {
      throw new UnauthorizedException({
        code: 'AUTH_SESSION_REVOKED',
        message: 'User session has been revoked or expired.',
      });
    }

    if (tokenFamily.status !== 'ACTIVE') {
      throw new UnauthorizedException({
        code: 'AUTH_TOKEN_FAMILY_REVOKED',
        message: 'Token family has been revoked due to prior security event.',
      });
    }

    if (session.user.status !== 'ACTIVE') {
      throw new UnauthorizedException({
        code: 'AUTH_USER_DISABLED',
        message: 'User account is inactive or disabled.',
      });
    }

    // 4. REPLAY ATTACK DETECTION:
    // If incoming token has status ROTATED, someone is attempting to reuse an old token!
    if (tokenRecord.status === 'ROTATED') {
      // Invalidate the entire token family and the entire session immediately in system context
      await this.prisma.runInSystemContext(async (tx) => {
        await tx.tokenFamily.update({
          where: { id: tokenFamily.id },
          data: { status: 'REVOKED', revokedAt: new Date() },
        });
        await tx.userSession.update({
          where: { id: session.id },
          data: { status: 'REVOKED', revokedAt: new Date() },
        });
        await tx.refreshTokenRecord.updateMany({
          where: { tokenFamilyId: tokenFamily.id, status: 'ACTIVE' },
          data: { status: 'REVOKED' },
        });
      });

      throw new UnauthorizedException({
        code: 'AUTH_TOKEN_REUSE_DETECTED',
        message: 'A previously rotated refresh token was replayed. All active sessions in this family have been terminated for security.',
      });
    }

    if (tokenRecord.status !== 'ACTIVE' || tokenRecord.expiresAt < new Date()) {
      throw new UnauthorizedException({
        code: 'AUTH_REFRESH_TOKEN_EXPIRED',
        message: 'Refresh token has expired.',
      });
    }

    // 5. Normal Rotation Path (Append-Only Monotonic Chain):
    const nextSeq = tokenRecord.sequenceNumber + 1;
    const newPlaintext = this.cryptoService.generateSecureToken();
    const newHash = this.cryptoService.hashToken(newPlaintext);
    const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Generate new access token (15 minutes)
    const accessPayload = {
      sub: session.user.id,
      email: session.user.email,
      orgId: session.organizationId,
      sessionId: session.id,
      authVersion: session.user.authVersion,
    };
    const newAccessToken = this.jwtService.sign(accessPayload, { expiresIn: '15m' });

    const sanitizedUser = {
      id: session.user.id,
      email: session.user.email,
      fullName: session.user.fullName,
      organizationId: session.organizationId,
    };

    const responsePayload = {
      accessToken: newAccessToken,
      refreshToken: newPlaintext,
      user: sanitizedUser,
    };

    // Encrypt envelope with AES-256-GCM
    const encrypted = this.cryptoService.encryptResponseEnvelope(responsePayload, {
      sessionId: session.id,
      tokenFamilyId: tokenFamily.id,
      endpoint,
      statusCode: 200,
    });

    // Generate new token ID beforehand
    const newId = crypto.randomUUID();

    // Execute atomic transaction for token swap and idempotency caching (30s TTL)
    await this.prisma.runInSystemContext(async (tx) => {
      // 1. Mark predecessor token as ROTATED and set replacedByTokenId = newId
      // Because fk_refresh_tokens_replacement and trg_refresh_tokens_monotonic_seq
      // are DEFERRABLE INITIALLY DEFERRED, they verify at commit after new token is created!
      await tx.refreshTokenRecord.update({
        where: { id: tokenRecord.id },
        data: {
          status: 'ROTATED',
          rotatedAt: new Date(),
          replacedByTokenId: newId,
        },
      });

      // 2. Insert new active token with id = newId and sequence n+1
      await tx.refreshTokenRecord.create({
        data: {
          id: newId,
          sessionId: session.id,
          tokenFamilyId: tokenFamily.id,
          tokenHash: newHash,
          sequenceNumber: nextSeq,
          status: 'ACTIVE',
          expiresAt: newExpiresAt,
        },
      });

      // 3. Cache idempotent response for exactly 30 seconds if key provided
      if (idempotencyKey) {
        const idempotencyExpiresAt = new Date(Date.now() + 30 * 1000); // 30s TTL per Phase 1D
        await tx.authIdempotencyRecord.create({
          data: {
            idempotencyKey,
            sessionId: session.id,
            tokenFamilyId: tokenFamily.id,
            requestTokenHash: incomingHash,
            endpoint,
            responseStatusCode: 200,
            responseHeaders: {},
            encryptedEnvelope: encrypted.encryptedEnvelope,
            keyId: encrypted.keyId,
            nonce: encrypted.nonce,
            authTag: encrypted.authTag,
            expiresAt: idempotencyExpiresAt,
          },
        });
      }
    });

    return responsePayload;
  }
}
