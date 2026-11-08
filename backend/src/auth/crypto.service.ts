import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

export interface EnvelopeContext {
  keyId: string;
  sessionId: string;
  tokenFamilyId: string;
  endpoint: string;
  statusCode: number;
}

export interface EncryptedEnvelopeResult {
  encryptedEnvelope: Buffer;
  nonce: Buffer;
  authTag: Buffer;
  keyId: string;
}

@Injectable()
export class CryptoService {
  private readonly defaultKeyId = 'k1-2026';
  private readonly envelopeKey: Buffer;

  constructor(private readonly configService: ConfigService) {
    const rawKey =
      this.configService.get<string>('auth.envelopeKey') ||
      'bizpro_aes_256_gcm_durable_secret_key_32b!';
    // Derive exactly 32 bytes (256 bits) using SHA-256
    this.envelopeKey = crypto.createHash('sha256').update(rawKey).digest();
  }

  /**
   * Hashes a password using bcrypt with 12 salt rounds.
   */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  /**
   * Validates a password against its bcrypt hash.
   */
  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generates a secure random 40-byte hex token for Refresh Tokens.
   */
  generateSecureToken(): string {
    return crypto.randomBytes(40).toString('hex');
  }

  /**
   * Hashes a refresh token string using SHA-256.
   */
  hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Constructs Canonical Binary Encoding for Additional Authenticated Data (AAD)
   * Length-prefixed 4-byte Big-Endian framing prevents delimiter injection attacks.
   */
  buildCanonicalAad(context: EnvelopeContext): Buffer {
    const keyIdBuf = Buffer.from(context.keyId, 'utf8');
    const sessionBuf = Buffer.from(context.sessionId, 'utf8');
    const familyBuf = Buffer.from(context.tokenFamilyId, 'utf8');
    const endpointBuf = Buffer.from(context.endpoint, 'utf8');

    const totalLen =
      4 + keyIdBuf.length +
      4 + sessionBuf.length +
      4 + familyBuf.length +
      4 + endpointBuf.length +
      4;

    const out = Buffer.alloc(totalLen);
    let offset = 0;

    out.writeUInt32BE(keyIdBuf.length, offset);
    offset += 4;
    keyIdBuf.copy(out, offset);
    offset += keyIdBuf.length;

    out.writeUInt32BE(sessionBuf.length, offset);
    offset += 4;
    sessionBuf.copy(out, offset);
    offset += sessionBuf.length;

    out.writeUInt32BE(familyBuf.length, offset);
    offset += 4;
    familyBuf.copy(out, offset);
    offset += familyBuf.length;

    out.writeUInt32BE(endpointBuf.length, offset);
    offset += 4;
    endpointBuf.copy(out, offset);
    offset += endpointBuf.length;

    out.writeInt32BE(context.statusCode, offset);
    return out;
  }

  /**
   * Encrypts a response payload using AES-256-GCM with a CSPRNG 96-bit Nonce and Canonical AAD.
   */
  encryptResponseEnvelope(
    payload: any,
    context: Omit<EnvelopeContext, 'keyId'>,
  ): EncryptedEnvelopeResult {
    const keyId = this.defaultKeyId;
    const fullContext: EnvelopeContext = { ...context, keyId };
    const aad = this.buildCanonicalAad(fullContext);

    // 96-bit (12 bytes) CSPRNG nonce per NIST SP 800-38D
    const nonce = crypto.randomBytes(12);

    const cipher = crypto.createCipheriv('aes-256-gcm', this.envelopeKey, nonce);
    cipher.setAAD(aad);

    const plaintext = Buffer.from(JSON.stringify(payload), 'utf8');
    const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
    const authTag = cipher.getAuthTag();

    return {
      encryptedEnvelope: ciphertext,
      nonce,
      authTag,
      keyId,
    };
  }

  /**
   * Decrypts an AES-256-GCM response envelope, verifying the 128-bit Auth Tag and Canonical AAD.
   * Throws UnauthorizedException if tampered or invalid.
   */
  decryptResponseEnvelope(
    encryptedEnvelope: Buffer,
    nonce: Buffer,
    authTag: Buffer,
    context: EnvelopeContext,
  ): any {
    try {
      const aad = this.buildCanonicalAad(context);
      const decipher = crypto.createDecipheriv('aes-256-gcm', this.envelopeKey, nonce);
      decipher.setAAD(aad);
      decipher.setAuthTag(authTag);

      const decrypted = Buffer.concat([
        decipher.update(encryptedEnvelope),
        decipher.final(),
      ]);

      return JSON.parse(decrypted.toString('utf8'));
    } catch {
      throw new UnauthorizedException({
        code: 'AUTH_ENVELOPE_VERIFICATION_FAILED',
        message: 'GCM Authentication Tag verification failed; response envelope has been corrupted or tampered with.',
      });
    }
  }

  /**
   * Hashes an OTP code using HMAC-SHA256.
   */
  hashOtp(otp: string): string {
    return crypto.createHmac('sha256', this.envelopeKey).update(otp).digest('hex');
  }

  /**
   * Constant-time comparison of OTP hash to mitigate timing attacks.
   */
  verifyOtpHash(otp: string, expectedHash: string): boolean {
    const computedHash = this.hashOtp(otp);
    if (computedHash.length !== expectedHash.length) return false;
    return crypto.timingSafeEqual(Buffer.from(computedHash), Buffer.from(expectedHash));
  }
}
