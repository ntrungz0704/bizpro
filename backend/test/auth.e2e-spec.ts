import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import * as cookieParser from 'cookie-parser';
import request = require('supertest');
import { AppModule } from '../src/app.module';
import { CryptoService } from '../src/auth/crypto.service';
import { API_PREFIX } from '../src/common/constants';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { TransformResponseInterceptor } from '../src/common/interceptors/transform-response.interceptor';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Authentication & Security Foundation E2E Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let cryptoService: CryptoService;

  const getCookies = (res: request.Response): string[] => {
    const raw = res.headers['set-cookie'];
    if (!raw) return [];
    return Array.isArray(raw) ? raw : [raw];
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.setGlobalPrefix(API_PREFIX);
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    const reflector = app.get(Reflector);
    app.useGlobalInterceptors(new TransformResponseInterceptor(reflector));

    await app.init();

    prisma = app.get(PrismaService);
    cryptoService = app.get(CryptoService);
  }, 30000);

  const runInSys = (fn: (tx: any) => any): Promise<any> =>
    prisma.runInSystemContext(fn);

  afterAll(async () => {
    await app.close();
  });

  describe('1. Seed & User Bootstrap Invariants', () => {
    it('should have initialized default Organization and Admin User', async () => {
      const org = await runInSys((tx) =>
        tx.organization.findUnique({
          where: { code: 'BIZPRO-CORP' },
        }),
      );
      expect(org).toBeDefined();
      expect(org?.name).toContain('BizPro+');

      const admin = await runInSys((tx) =>
        tx.user.findFirst({
          where: { email: 'admin@bizpro.vn' },
        }),
      );
      expect(admin).toBeDefined();
      expect(admin?.status).toBe('ACTIVE');
    });
  });

  describe('2. POST /api/v1/auth/login', () => {
    it('should fail with HTTP 401 when password is wrong', async () => {
      const res = await request(app.getHttpServer())
        .post(`/${API_PREFIX}/v1/auth/login`)
        .send({
          email: 'admin@bizpro.vn',
          password: 'IncorrectPassword',
        })
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.code || res.body.error).toBe('AUTH_INVALID_CREDENTIALS');
      expect(res.body.attemptsRemaining).toBeDefined();
    });

    it('should login successfully with valid credentials and return tokens & cookies', async () => {
      // First reset failed attempts if any
      await runInSys((tx) =>
        tx.user.updateMany({
          where: { email: 'admin@bizpro.vn' },
          data: { failedLoginAttempts: 0, lockedUntil: null },
        }),
      );

      const res = await request(app.getHttpServer())
        .post(`/${API_PREFIX}/v1/auth/login`)
        .send({
          email: 'admin@bizpro.vn',
          password: 'Admin@123456',
        })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.user.email).toBe('admin@bizpro.vn');
      expect(res.body.data.session.id).toBeDefined();

      // Check Cookies
      const cookies = getCookies(res);
      expect(cookies.length).toBeGreaterThan(0);
      const hasBizproToken = cookies.some((c: string) => c.includes('bizpro_refresh_token='));
      expect(hasBizproToken).toBe(true);
    });

    it('should enforce account lockout (HTTP 423) after 5 consecutive failures', async () => {
      const testEmail = 'user@bizpro.vn';
      await runInSys((tx) =>
        tx.user.updateMany({
          where: { email: testEmail },
          data: { failedLoginAttempts: 0, lockedUntil: null },
        }),
      );

      // 4 failures -> 401
      for (let i = 1; i <= 4; i++) {
        const res = await request(app.getHttpServer())
          .post(`/${API_PREFIX}/v1/auth/login`)
          .send({ email: testEmail, password: 'WrongPassword' })
          .expect(401);
        expect(res.body.attemptsRemaining).toBe(5 - i);
      }

      // 5th failure -> 423 Locked
      const lockRes = await request(app.getHttpServer())
        .post(`/${API_PREFIX}/v1/auth/login`)
        .send({ email: testEmail, password: 'WrongPassword' })
        .expect(423);

      expect(lockRes.body.code || lockRes.body.error).toBe('AUTH_ACCOUNT_LOCKED');
      expect(lockRes.body.lockedUntil).toBeDefined();

      // 6th attempt while locked -> 423 fast-path rejection
      await request(app.getHttpServer())
        .post(`/${API_PREFIX}/v1/auth/login`)
        .send({ email: testEmail, password: 'WrongPassword' })
        .expect(423);

      // Clean up test user lockout
      await runInSys((tx) =>
        tx.user.updateMany({
          where: { email: testEmail },
          data: { failedLoginAttempts: 0, lockedUntil: null },
        }),
      );
    });
  });

  describe('3. Account Unlock Flow (/request-unlock & /unlock)', () => {
    it('should unlock locked account with valid OTP code', async () => {
      const testEmail = 'user@bizpro.vn';

      // 1. Lock the account
      await runInSys((tx) =>
        tx.user.updateMany({
          where: { email: testEmail },
          data: {
            failedLoginAttempts: 5,
            lockedUntil: new Date(Date.now() + 15 * 60 * 1000),
          },
        }),
      );

      // 2. Request Unlock (Anti-enumeration returns 200)
      await request(app.getHttpServer())
        .post(`/${API_PREFIX}/v1/auth/request-unlock`)
        .send({ email: testEmail })
        .expect(200);

      // Verify OTP hash exists in DB
      const userAfterRequest = await runInSys((tx) =>
        tx.user.findFirst({
          where: { email: testEmail },
        }),
      );
      expect(userAfterRequest?.unlockOtpHash).toBeDefined();

      // Set known OTP for testing
      const knownOtp = '654321';
      const knownHash = cryptoService.hashOtp(knownOtp);
      await runInSys((tx) =>
        tx.user.update({
          where: { id: userAfterRequest!.id },
          data: {
            unlockOtpHash: knownHash,
            unlockOtpExpiresAt: new Date(Date.now() + 15 * 60 * 1000),
            unlockOtpAttempts: 0,
          },
        }),
      );

      // 3. Unlock with correct OTP -> 200
      const unlockRes = await request(app.getHttpServer())
        .post(`/${API_PREFIX}/v1/auth/unlock`)
        .send({ email: testEmail, otpCode: knownOtp })
        .expect(200);

      expect(unlockRes.body.data.unlockedAt).toBeDefined();

      // Verify DB state is unlocked
      const unlockedUser = await runInSys((tx) =>
        tx.user.findFirst({
          where: { email: testEmail },
        }),
      );
      expect(unlockedUser?.lockedUntil).toBeNull();
      expect(unlockedUser?.failedLoginAttempts).toBe(0);
    });
  });

  describe('4. Token Family Rotation & Strict Monotonic Sequence', () => {
    it('should rotate token, increment sequence, and mark previous token as ROTATED', async () => {
      // 1. Login to obtain cookie and initial refresh token
      const loginRes = await request(app.getHttpServer())
        .post(`/${API_PREFIX}/v1/auth/login`)
        .send({ email: 'admin@bizpro.vn', password: 'Admin@123456' })
        .expect(200);

      const loginCookies = getCookies(loginRes);
      const rawCookie = loginCookies.find((c: string) => c.startsWith('bizpro_refresh_token='))!;
      const tokenVal = rawCookie.split(';')[0].split('=')[1];
      const initialTokenHash = cryptoService.hashToken(tokenVal);

      // Verify initial token in DB is sequence 1 and ACTIVE
      const initialRecord = await runInSys((tx) =>
        tx.refreshTokenRecord.findUnique({
          where: { tokenHash: initialTokenHash },
        }),
      );
      expect(initialRecord).toBeDefined();
      expect(initialRecord?.sequenceNumber).toBe(1);
      expect(initialRecord?.status).toBe('ACTIVE');

      // 2. Perform Web Refresh
      const refreshRes = await request(app.getHttpServer())
        .post(`/${API_PREFIX}/v1/auth/refresh/web`)
        .set('Cookie', loginCookies)
        .expect(200);

      expect(refreshRes.body.data.accessToken).toBeDefined();

      // Old token must now be ROTATED with replacedByTokenId set
      const updatedOldRecord = await runInSys((tx) =>
        tx.refreshTokenRecord.findUnique({
          where: { tokenHash: initialTokenHash },
        }),
      );
      expect(updatedOldRecord?.status).toBe('ROTATED');
      expect(updatedOldRecord?.replacedByTokenId).toBeDefined();

      // New token must have sequenceNumber = 2
      const newRecord = await runInSys((tx) =>
        tx.refreshTokenRecord.findUnique({
          where: { id: updatedOldRecord!.replacedByTokenId! },
        }),
      );
      expect(newRecord?.sequenceNumber).toBe(2);
      expect(newRecord?.status).toBe('ACTIVE');
      expect(newRecord?.tokenFamilyId).toBe(initialRecord?.tokenFamilyId);
    });
  });

  describe('5. 30-Second AES-256-GCM Idempotent Recovery Protocol', () => {
    it('should recover identical response when retrying with the same idempotency key and token', async () => {
      // 1. Login
      const loginRes = await request(app.getHttpServer())
        .post(`/${API_PREFIX}/v1/auth/login`)
        .send({ email: 'admin@bizpro.vn', password: 'Admin@123456' })
        .expect(200);

      const cookies = loginRes.headers['set-cookie'];
      const idempotencyKey = '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d';

      // 2. First Refresh with Idempotency Key
      const firstRes = await request(app.getHttpServer())
        .post(`/${API_PREFIX}/v1/auth/refresh/web`)
        .set('Cookie', cookies)
        .set('Idempotency-Key', idempotencyKey)
        .expect(200);

      const firstAccessToken = firstRes.body.data.accessToken;

      // 3. Replay EXACT SAME request (simulating network dropped response)
      const replayRes = await request(app.getHttpServer())
        .post(`/${API_PREFIX}/v1/auth/refresh/web`)
        .set('Cookie', cookies)
        .set('Idempotency-Key', idempotencyKey)
        .expect(200);

      expect(replayRes.headers['x-idempotency-replay']).toBe('true');
      expect(replayRes.body.data.accessToken).toBe(firstAccessToken);
    });

    it('should reject with HTTP 422 when the same Idempotency-Key is reused with a different token', async () => {
      // Login first user session
      const loginRes1 = await request(app.getHttpServer())
        .post(`/${API_PREFIX}/v1/auth/login`)
        .send({ email: 'admin@bizpro.vn', password: 'Admin@123456' })
        .expect(200);

      const sharedKey = 'shared-idempotency-key-test-uuid-422';

      // First refresh succeeds
      await request(app.getHttpServer())
        .post(`/${API_PREFIX}/v1/auth/refresh/web`)
        .set('Cookie', loginRes1.headers['set-cookie'])
        .set('Idempotency-Key', sharedKey)
        .expect(200);

      // Now create a different token in the same session by logging in or rotating
      const cookies1 = getCookies(loginRes1);
      const rawCookie1 = cookies1.find((c: string) => c.startsWith('bizpro_refresh_token='))!;
      const token1 = rawCookie1.split(';')[0].split('=')[1];
      const record1 = await runInSys((tx) =>
        tx.refreshTokenRecord.findUnique({
          where: { tokenHash: cryptoService.hashToken(token1) },
        }),
      );

      // Insert another token in same session for testing payload mismatch
      const fakeToken = cryptoService.generateSecureToken();
      await runInSys((tx) =>
        tx.refreshTokenRecord.create({
          data: {
            sessionId: record1!.sessionId,
            tokenFamilyId: record1!.tokenFamilyId,
            tokenHash: cryptoService.hashToken(fakeToken),
            sequenceNumber: 99,
            status: 'REVOKED',
            expiresAt: new Date(Date.now() + 60000),
          },
        }),
      );

      // Replay using different token with same idempotency key -> 422
      const mismatchRes = await request(app.getHttpServer())
        .post(`/${API_PREFIX}/v1/auth/refresh/web`)
        .set('Cookie', [`bizpro_refresh_token=${fakeToken}`])
        .set('Idempotency-Key', sharedKey)
        .expect(422);

      expect(mismatchRes.body.code || mismatchRes.body.error).toBe('AUTH_IDEMPOTENCY_PAYLOAD_MISMATCH');
    });
  });

  describe('6. Token Replay / Reuse Detection (Security Mitigation)', () => {
    it('should revoke Token Family and Session immediately when an old rotated token is replayed without idempotency record', async () => {
      // 1. Login
      const loginRes = await request(app.getHttpServer())
        .post(`/${API_PREFIX}/v1/auth/login`)
        .send({ email: 'admin@bizpro.vn', password: 'Admin@123456' })
        .expect(200);

      const initialCookies = getCookies(loginRes);
      const rawCookie = initialCookies.find((c: string) => c.startsWith('bizpro_refresh_token='))!;
      const oldToken = rawCookie.split(';')[0].split('=')[1];

      // 2. Legitimate refresh rotates token (no idempotency key used)
      const refreshRes = await request(app.getHttpServer())
        .post(`/${API_PREFIX}/v1/auth/refresh/web`)
        .set('Cookie', initialCookies)
        .expect(200);

      expect(refreshRes.body.data.accessToken).toBeDefined();

      // 3. Attacker replays OLD TOKEN -> must trigger Replay Attack detection
      const replayAttackRes = await request(app.getHttpServer())
        .post(`/${API_PREFIX}/v1/auth/refresh/web`)
        .set('Cookie', initialCookies) // Replaying old token!
        .expect(401);

      expect(replayAttackRes.body.code || replayAttackRes.body.error).toBe('AUTH_TOKEN_REUSE_DETECTED');

      // 4. Verify in DB that the token family and session are REVOKED
      const oldRecord = await runInSys((tx) =>
        tx.refreshTokenRecord.findUnique({
          where: { tokenHash: cryptoService.hashToken(oldToken) },
          include: { tokenFamily: true, session: true },
        }),
      );

      expect(oldRecord?.tokenFamily.status).toBe('REVOKED');
      expect(oldRecord?.session.status).toBe('REVOKED');
    });
  });

  describe('7. User Profile & JWT Guard (GET /api/v1/auth/me)', () => {
    it('should return profile and organization for valid Bearer token', async () => {
      const loginRes = await request(app.getHttpServer())
        .post(`/${API_PREFIX}/v1/auth/login`)
        .send({ email: 'admin@bizpro.vn', password: 'Admin@123456' })
        .expect(200);

      const accessToken = loginRes.body.data.accessToken;

      const meRes = await request(app.getHttpServer())
        .get(`/${API_PREFIX}/v1/auth/me`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(meRes.body.data.email).toBe('admin@bizpro.vn');
      expect(meRes.body.data.organization.code).toBe('BIZPRO-CORP');
      expect(meRes.body.data.permissions).toContain('auth.users.read');
    });

    it('should reject request without token with HTTP 401', async () => {
      await request(app.getHttpServer())
        .get(`/${API_PREFIX}/v1/auth/me`)
        .expect(401);
    });
  });

  describe('8. Logout & Global Killswitch (POST /auth/logout & /auth/logout-all)', () => {
    it('should revoke session on logout', async () => {
      const loginRes = await request(app.getHttpServer())
        .post(`/${API_PREFIX}/v1/auth/login`)
        .send({ email: 'admin@bizpro.vn', password: 'Admin@123456' })
        .expect(200);

      const accessToken = loginRes.body.data.accessToken;
      const sessionId = loginRes.body.data.session.id;

      // Logout
      await request(app.getHttpServer())
        .post(`/${API_PREFIX}/v1/auth/logout`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      // Verify session in DB is REVOKED
      const session = await runInSys((tx) =>
        tx.userSession.findUnique({
          where: { id: sessionId },
        }),
      );
      expect(session?.status).toBe('REVOKED');
    });

    it('should increment auth_version on logout-all and immediately invalidate existing JWT', async () => {
      const loginRes = await request(app.getHttpServer())
        .post(`/${API_PREFIX}/v1/auth/login`)
        .send({ email: 'admin@bizpro.vn', password: 'Admin@123456' })
        .expect(200);

      const accessToken = loginRes.body.data.accessToken;

      // Call logout-all
      await request(app.getHttpServer())
        .post(`/${API_PREFIX}/v1/auth/logout-all`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      // Subsequent call with the SAME access token must fail with 401
      await request(app.getHttpServer())
        .get(`/${API_PREFIX}/v1/auth/me`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(401);
    });
  });
});
