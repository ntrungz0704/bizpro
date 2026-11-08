import { HttpStatus, INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Environment, validate } from '../src/config/env.validation';
import { PrismaService } from '../src/prisma/prisma.service';

jest.setTimeout(30000);

describe('PHASE 3B — SECURITY HARDENING E2E SPECIFICATION', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let configService: ConfigService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');

    // Apply exact production helmet middleware
    app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'data:', 'https:'],
            connectSrc: ["'self'", 'http://localhost:3000', 'https:'],
          },
        },
        crossOriginEmbedderPolicy: false,
        crossOriginResourcePolicy: { policy: 'cross-origin' },
        hidePoweredBy: true,
        hsts: {
          maxAge: 31536000,
          includeSubDomains: true,
          preload: true,
        },
        noSniff: true,
        xssFilter: true,
      }),
    );

    configService = app.get<ConfigService>(ConfigService);
    if (configService.get<boolean>('swagger.enabled')) {
      const swaggerConfig = new DocumentBuilder()
        .setTitle('BizPro+')
        .setVersion('1.0.0')
        .build();
      const document = SwaggerModule.createDocument(app, swaggerConfig);
      SwaggerModule.setup('api/v1/docs', app, document);
    }

    prisma = app.get<PrismaService>(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  // =========================================================================
  // SCENARIO 1: BLK-01 ENVIRONMENT SECRETS VALIDATION
  // =========================================================================
  describe('TC-SEC-01: Environment Secrets Fail-Fast Validation', () => {
    it('TC-SEC-01A: Should reject startup in production if mandatory secrets are missing', () => {
      const config = {
        NODE_ENV: Environment.Production,
        PORT: 4000,
      };

      expect(() => validate(config)).toThrow(
        /Production startup rejected: Missing mandatory environment secret/,
      );
    });

    it('TC-SEC-01B: Should reject startup in production if known default/fallback secrets are used', () => {
      const config = {
        NODE_ENV: Environment.Production,
        PORT: 4000,
        DATABASE_URL: 'postgresql://bizpro_app:complex_pw_123@localhost:5432/bizpro_db',
        JWT_ACCESS_SECRET: 'bizpro_access_secret_super_secure_key_change_in_production',
        JWT_REFRESH_SECRET: 'random_very_secure_string_with_more_than_32_characters_here_123',
        AUTH_RESPONSE_ENVELOPE_KEY: 'random_very_secure_string_with_more_than_32_characters_here_456',
      };

      expect(() => validate(config)).toThrow(
        /Production startup rejected: Default\/placeholder secret\(s\) detected/,
      );
    });

    it('TC-SEC-01C: Should reject startup in production if secrets have insufficient entropy (< 32 chars)', () => {
      const config = {
        NODE_ENV: Environment.Production,
        PORT: 4000,
        DATABASE_URL: 'postgresql://bizpro_app:complex_pw_123@localhost:5432/bizpro_db',
        JWT_ACCESS_SECRET: 'short_secret_under_32_chars',
        JWT_REFRESH_SECRET: 'another_short_secret',
        AUTH_RESPONSE_ENVELOPE_KEY: 'short_key',
      };

      expect(() => validate(config)).toThrow(
        /Production startup rejected: Insecure weak secret\(s\)/,
      );
    });

    it('TC-SEC-01D: Should reject startup in production if connecting with default dev superuser credentials', () => {
      const config = {
        NODE_ENV: Environment.Production,
        PORT: 4000,
        DATABASE_URL: 'postgresql://bizpro_user:bizpro_password@localhost:5432/bizpro_db',
        JWT_ACCESS_SECRET: 'random_secure_access_secret_key_with_at_least_32_characters_1',
        JWT_REFRESH_SECRET: 'random_secure_refresh_secret_key_with_at_least_32_characters_2',
        AUTH_RESPONSE_ENVELOPE_KEY: 'random_secure_envelope_key_with_at_least_32_characters_3',
      };

      expect(() => validate(config)).toThrow(
        /Production startup rejected: DATABASE_URL must not connect with the default development credentials/,
      );
    });

    it('TC-SEC-01E: Should successfully validate when strong, high-entropy secrets are provided in production', () => {
      const config = {
        NODE_ENV: Environment.Production,
        PORT: 4000,
        DATABASE_URL: 'postgresql://bizpro_app:complex_prod_password_987@localhost:5432/bizpro_db',
        JWT_ACCESS_SECRET: 'random_secure_access_secret_key_with_at_least_32_characters_1',
        JWT_REFRESH_SECRET: 'random_secure_refresh_secret_key_with_at_least_32_characters_2',
        AUTH_RESPONSE_ENVELOPE_KEY: 'random_secure_envelope_key_with_at_least_32_characters_3',
      };

      const result = validate(config);
      expect(result).toBeDefined();
      expect(result.NODE_ENV).toBe(Environment.Production);
    });

    it('TC-SEC-01F: Should allow safe default fallbacks in development/test environment', () => {
      const config = {
        NODE_ENV: Environment.Development,
      };

      const result = validate(config);
      expect(result).toBeDefined();
      expect(result.JWT_ACCESS_SECRET).toBeDefined();
      expect(result.DATABASE_URL).toBeDefined();
    });
  });

  // =========================================================================
  // SCENARIO 2: BLK-06 HELMET & HTTP SECURITY HEADERS
  // =========================================================================
  describe('TC-SEC-02: Helmet HTTP Security Headers Verification', () => {
    it('TC-SEC-02A: Should return essential security headers on HTTP responses', async () => {
      const response = await request(app.getHttpServer()).get('/api/v1/health/live');

      expect(response.status).toBe(HttpStatus.OK);
      // X-Content-Type-Options: nosniff
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      // X-Frame-Options: SAMEORIGIN
      expect(response.headers['x-frame-options']).toBe('SAMEORIGIN');
      // Content-Security-Policy
      expect(response.headers['content-security-policy']).toBeDefined();
      expect(response.headers['content-security-policy']).toContain("default-src 'self'");
      // Strict-Transport-Security (HSTS)
      expect(response.headers['strict-transport-security']).toBeDefined();
      expect(response.headers['strict-transport-security']).toContain('max-age=31536000');
      // X-Powered-By must be hidden
      expect(response.headers['x-powered-by']).toBeUndefined();
    });
  });

  // =========================================================================
  // SCENARIO 3: SWAGGER PRODUCTION EXPOSURE CONTROL
  // =========================================================================
  describe('TC-SEC-03: Swagger Production Controlled Exposure', () => {
    it('TC-SEC-03A: Swagger documentation should be accessible in Development/Test mode', async () => {
      const response = await request(app.getHttpServer()).get('/api/v1/docs');
      expect([HttpStatus.OK, HttpStatus.MOVED_PERMANENTLY, HttpStatus.PERMANENT_REDIRECT]).toContain(
        response.status,
      );
    });

    it('TC-SEC-03B: Swagger configuration flag respects production setting', () => {
      const devConfig = {
        NODE_ENV: Environment.Development,
      };
      const validatedDev = validate(devConfig);
      expect(validatedDev.ENABLE_SWAGGER).toBeUndefined(); // defaults to enabled in dev

      const prodConfigWithoutSwagger = {
        NODE_ENV: Environment.Production,
        DATABASE_URL: 'postgresql://bizpro_app:complex_prod_password_987@localhost:5432/bizpro_db',
        JWT_ACCESS_SECRET: 'random_secure_access_secret_key_with_at_least_32_characters_1',
        JWT_REFRESH_SECRET: 'random_secure_refresh_secret_key_with_at_least_32_characters_2',
        AUTH_RESPONSE_ENVELOPE_KEY: 'random_secure_envelope_key_with_at_least_32_characters_3',
        ENABLE_SWAGGER: false,
      };
      const validatedProd = validate(prodConfigWithoutSwagger);
      expect(validatedProd.ENABLE_SWAGGER).toBe(false);
    });
  });

  // =========================================================================
  // SCENARIO 4: DATABASE RUNTIME ROLE & RLS VERIFICATION
  // =========================================================================
  describe('TC-SEC-04: Database Runtime Role & RLS Verification', () => {
    it('TC-SEC-04A: Application runtime database role must NOT be SUPERUSER or BYPASSRLS', async () => {
      const userResult: Array<{ current_user: string }> = await prisma.$queryRaw`
        SELECT current_user::text;
      `;
      expect(userResult.length).toBe(1);
      const currentUser = userResult[0].current_user;
      expect(currentUser).toBe('bizpro_app');

      const roleResult: Array<{ rolsuper: boolean; rolbypassrls: boolean }> = await prisma.$queryRaw`
        SELECT rolsuper, rolbypassrls FROM pg_roles WHERE rolname = ${currentUser};
      `;
      expect(roleResult.length).toBe(1);
      expect(roleResult[0].rolsuper).toBe(false);
      expect(roleResult[0].rolbypassrls).toBe(false);
    });

    it('TC-SEC-04B: Missing tenant context must fail closed (returns 0 records)', async () => {
      const customers = await prisma.$queryRaw<Array<{ id: string }>>`
        SELECT id FROM customers;
      `;
      expect(customers.length).toBe(0);
    });

    it('TC-SEC-04C: Strict cross-tenant isolation: Tenant A cannot read Tenant B data', async () => {
      const tenantAId = 'a1111111-1111-1111-1111-111111111111';
      const tenantBId = 'b2222222-2222-2222-2222-222222222222';

      // Seed organization A and customer in Tenant A context
      await prisma.runInTenantContext(tenantAId, async (tx) => {
        await tx.$queryRaw`
          INSERT INTO organizations (id, name, code, email, status, updated_at)
          VALUES (${tenantAId}::uuid, 'Org A Security Test', 'ORG-SEC-A', 'orga@test.com', 'ACTIVE', NOW())
          ON CONFLICT (id) DO NOTHING;
        `;
        await tx.$queryRaw`
          INSERT INTO customers (id, organization_id, name, customer_code, status, updated_at)
          VALUES (gen_random_uuid(), ${tenantAId}::uuid, 'Customer of Tenant A', 'CUST-A-01', 'ACTIVE', NOW())
          ON CONFLICT (organization_id, customer_code) DO NOTHING;
        `;
      });

      // Query from Tenant B context: must return 0 records
      await prisma.runInTenantContext(tenantBId, async (tx) => {
        const records = await tx.$queryRaw<Array<{ id: string; name: string }>>`
          SELECT id, name FROM customers;
        `;
        const leaked = records.filter((r) => r.name === 'Customer of Tenant A');
        expect(leaked.length).toBe(0);
      });

      // Cleanup
      await prisma.runInTenantContext(tenantAId, async (tx) => {
        await tx.$queryRaw`DELETE FROM customers WHERE organization_id = ${tenantAId}::uuid;`;
        await tx.$queryRaw`DELETE FROM organizations WHERE id = ${tenantAId}::uuid;`;
      });
    });
  });
});
