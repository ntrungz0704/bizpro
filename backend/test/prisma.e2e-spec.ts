import { INestApplication } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import request = require('supertest');
import { AppModule } from '../src/app.module';
import { API_PREFIX } from '../src/common/constants';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { TransformResponseInterceptor } from '../src/common/interceptors/transform-response.interceptor';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Prisma & Database Connectivity (Integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix(API_PREFIX);
    app.useGlobalFilters(new HttpExceptionFilter());
    const reflector = app.get(Reflector);
    app.useGlobalInterceptors(new TransformResponseInterceptor(reflector));

    prisma = app.get(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  it('PrismaService should be defined and injected via NestJS DI', () => {
    expect(prisma).toBeDefined();
  });

  it('PrismaService should execute a raw ping query against PostgreSQL', async () => {
    const result = await prisma.$queryRaw<Array<{ ping: number }>>`SELECT 1 as ping`;
    expect(result).toBeDefined();
    expect(Number(result[0].ping)).toBe(1);
  });

  it('PrismaService.isHealthy() should return status: true and latency', async () => {
    const health = await prisma.isHealthy();
    expect(health.status).toBe(true);
    expect(typeof health.latencyMs).toBe('number');
    expect(health.error).toBeUndefined();
  });

  it('Readiness check /api/health/ready should return 200 when PostgreSQL is healthy', async () => {
    const response = await request(app.getHttpServer())
      .get(`/${API_PREFIX}/health/ready`)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.statusCode).toBe(200);
    expect(response.body.data.status).toBe('ok');
    expect(response.body.data.info.database.status).toBe('up');
    expect(response.body.data.info.system.ready).toBe(true);
  });

  it('Readiness check should return 503 when Database is disconnected/unhealthy', async () => {
    // Mock prisma.isHealthy to simulate database outage
    jest.spyOn(prisma, 'isHealthy').mockResolvedValueOnce({
      status: false,
      latencyMs: 15,
      error: 'Connection to PostgreSQL severed',
    });

    const response = await request(app.getHttpServer())
      .get(`/${API_PREFIX}/health/ready`)
      .expect(503);

    expect(response.body.success).toBe(false);
    expect(response.body.statusCode).toBe(503);
    expect(response.body.error).toContain('ServiceUnavailable');
  });
});
