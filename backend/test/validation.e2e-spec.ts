import {
  Body,
  Controller,
  INestApplication,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import request = require('supertest');
import { API_PREFIX } from '../src/common/constants';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { TransformResponseInterceptor } from '../src/common/interceptors/transform-response.interceptor';

class TestDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsNumber()
  @Min(0)
  quantity!: number;
}

@Controller('test-validation')
class TestValidationController {
  @Post()
  create(@Body() dto: TestDto) {
    return { created: true, data: dto };
  }
}

describe('Global ValidationPipe (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [TestValidationController],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix(API_PREFIX);
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    const reflector = app.get(Reflector);
    app.useGlobalInterceptors(new TransformResponseInterceptor(reflector));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should accept valid payload and return unified response envelope', () => {
    return request(app.getHttpServer())
      .post(`/${API_PREFIX}/test-validation`)
      .send({ name: 'BizPro Product', quantity: 50 })
      .expect(201)
      .expect((res) => {
        expect(res.body.success).toBe(true);
        expect(res.body.statusCode).toBe(201);
        expect(res.body.data.created).toBe(true);
        expect(res.body.data.data.name).toBe('BizPro Product');
        expect(res.body.data.data.quantity).toBe(50);
      });
  });

  it('should reject unwhitelisted properties with 400 Bad Request envelope', () => {
    return request(app.getHttpServer())
      .post(`/${API_PREFIX}/test-validation`)
      .send({
        name: 'BizPro Product',
        quantity: 50,
        unauthorizedField: 'malicious_input',
      })
      .expect(400)
      .expect((res) => {
        expect(res.body.success).toBe(false);
        expect(res.body.statusCode).toBe(400);
        expect(res.body.error).toBe('Bad Request');
        expect(res.body.path).toBe(`/${API_PREFIX}/test-validation`);
        expect(JSON.stringify(res.body.message)).toContain(
          'property unauthorizedField should not exist',
        );
      });
  });

  it('should reject invalid types with 400 Bad Request envelope', () => {
    return request(app.getHttpServer())
      .post(`/${API_PREFIX}/test-validation`)
      .send({ name: '', quantity: -10 })
      .expect(400)
      .expect((res) => {
        expect(res.body.success).toBe(false);
        expect(res.body.statusCode).toBe(400);
        expect(res.body.error).toBe('Bad Request');
        expect(Array.isArray(res.body.message)).toBe(true);
      });
  });
});
