import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import * as crypto from 'crypto';
import { CryptoService, EnvelopeContext } from './crypto.service';

describe('CryptoService', () => {
  let service: CryptoService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CryptoService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'auth.envelopeKey') return 'test_super_secure_aes_256_gcm_envelope_key_32b';
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<CryptoService>(CryptoService);
  });

  describe('Password Hashing (bcrypt 12 rounds)', () => {
    it('should hash a password and verify correctly', async () => {
      const rawPassword = 'Password123!@#';
      const hash = await service.hashPassword(rawPassword);
      expect(hash).toBeDefined();
      expect(hash.startsWith('$2b$12$')).toBe(true);

      const isValid = await service.comparePassword(rawPassword, hash);
      expect(isValid).toBe(true);

      const isInvalid = await service.comparePassword('WrongPassword', hash);
      expect(isInvalid).toBe(false);
    });
  });

  describe('Secure Token Generation (CSPRNG)', () => {
    it('should generate a 40-byte (80 hex characters) cryptographic random token', () => {
      const token1 = service.generateSecureToken();
      const token2 = service.generateSecureToken();

      expect(token1).toHaveLength(80);
      expect(token2).toHaveLength(80);
      expect(token1).not.toBe(token2);
    });

    it('should compute consistent SHA-256 hash of tokens', () => {
      const token = service.generateSecureToken();
      const hash1 = service.hashToken(token);
      const hash2 = service.hashToken(token);

      expect(hash1).toHaveLength(64);
      expect(hash1).toBe(hash2);
      expect(hash1).toBe(crypto.createHash('sha256').update(token).digest('hex'));
    });
  });

  describe('AES-256-GCM Envelope Encryption & Decryption', () => {
    const context: EnvelopeContext = {
      keyId: 'k1-2026',
      sessionId: 'sess_9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
      tokenFamilyId: 'fam_84b391d1-7290-482a-a92c-0e78f993104a',
      endpoint: '/api/v1/auth/refresh/web',
      statusCode: 200,
    };

    const payload = {
      accessToken: 'jwt_mock_access_token_value_for_testing',
      refreshToken: 'rt_mock_refresh_token_value_for_testing',
      user: { id: 'usr_123', email: 'admin@bizpro.vn' },
    };

    it('should encrypt and decrypt envelope payload successfully with canonical AAD', () => {
      const encrypted = service.encryptResponseEnvelope(payload, context);

      expect(encrypted.encryptedEnvelope).toBeInstanceOf(Buffer);
      expect(encrypted.nonce).toBeInstanceOf(Buffer);
      expect(encrypted.nonce).toHaveLength(12); // NIST 96-bit CSPRNG nonce
      expect(encrypted.authTag).toBeInstanceOf(Buffer);
      expect(encrypted.authTag).toHaveLength(16); // 128-bit GCM auth tag
      expect(encrypted.keyId).toBe('k1-2026');

      const decrypted = service.decryptResponseEnvelope(
        encrypted.encryptedEnvelope,
        encrypted.nonce,
        encrypted.authTag,
        context,
      );

      expect(decrypted).toEqual(payload);
    });

    it('should fail-closed and throw when ciphertext is tampered', () => {
      const encrypted = service.encryptResponseEnvelope(payload, context);
      const tamperedCiphertext = Buffer.from(encrypted.encryptedEnvelope);
      tamperedCiphertext[0] ^= 0xff; // Flip bits

      expect(() =>
        service.decryptResponseEnvelope(
          tamperedCiphertext,
          encrypted.nonce,
          encrypted.authTag,
          context,
        ),
      ).toThrow();
    });

    it('should fail-closed and throw when authTag is corrupted', () => {
      const encrypted = service.encryptResponseEnvelope(payload, context);
      const tamperedTag = Buffer.from(encrypted.authTag);
      tamperedTag[0] ^= 0xaa; // Corrupt tag

      expect(() =>
        service.decryptResponseEnvelope(
          encrypted.encryptedEnvelope,
          encrypted.nonce,
          tamperedTag,
          context,
        ),
      ).toThrow();
    });

    it('should fail-closed and throw when AAD context is modified (e.g. wrong session or endpoint)', () => {
      const encrypted = service.encryptResponseEnvelope(payload, context);
      const wrongContext: EnvelopeContext = {
        ...context,
        sessionId: 'sess_attacker_hijacked_session_id',
      };

      expect(() =>
        service.decryptResponseEnvelope(
          encrypted.encryptedEnvelope,
          encrypted.nonce,
          encrypted.authTag,
          wrongContext,
        ),
      ).toThrow();
    });

    it('should generate distinct nonces for consecutive encryptions (Zero Nonce Reuse)', () => {
      const enc1 = service.encryptResponseEnvelope(payload, context);
      const enc2 = service.encryptResponseEnvelope(payload, context);
      const enc3 = service.encryptResponseEnvelope(payload, context);

      expect(enc1.nonce.equals(enc2.nonce)).toBe(false);
      expect(enc2.nonce.equals(enc3.nonce)).toBe(false);
      expect(enc1.nonce.equals(enc3.nonce)).toBe(false);
    });
  });

  describe('OTP HMAC-SHA256 & Constant-time Verification', () => {
    it('should hash OTP and verify valid/invalid codes', () => {
      const otp = '582910';
      const hash = service.hashOtp(otp);

      expect(hash).toHaveLength(64);
      expect(service.verifyOtpHash(otp, hash)).toBe(true);
      expect(service.verifyOtpHash('000000', hash)).toBe(false);
      expect(service.verifyOtpHash('58291', hash)).toBe(false);
    });
  });
});
