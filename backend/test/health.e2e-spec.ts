import { INestApplication } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import request = require('supertest');
import { AppModule } from '../src/app.module';
import { API_PREFIX } from '../src/common/constants';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { TransformResponseInterceptor } from '../src/common/interceptors/transform-response.interceptor';

describe('HealthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix(API_PREFIX);
    app.useGlobalFilters(new HttpExceptionFilter());
    const reflector = app.get(Reflector);
    app.useGlobalInterceptors(new TransformResponseInterceptor(reflector));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/api/health/live (GET) returns status 200 and process liveness info', () => {
    return request(app.getHttpServer())
      .get(`/${API_PREFIX}/health/live`)
      .expect(200)
      .expect((res) => {
        expect(res.body.success).toBe(true);
        expect(res.body.statusCode).toBe(200);
        expect(res.body.data.status).toBe('ok');
        expect(res.body.data.info.process.status).toBe('up');
        expect(res.body.timestamp).toBeDefined();
      });
  });

  it('/api/health/ready (GET) returns status 200 and readiness status', () => {
    return request(app.getHttpServer())
      .get(`/${API_PREFIX}/health/ready`)
      .expect(200)
      .expect((res) => {
        expect(res.body.success).toBe(true);
        expect(res.body.statusCode).toBe(200);
        expect(res.body.data.status).toBe('ok');
        expect(res.body.data.info.system.ready).toBe(true);
        expect(res.body.timestamp).toBeDefined();
      });
  });
});
