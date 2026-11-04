import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import {
  API_PREFIX,
  APP_DESCRIPTION,
  APP_NAME,
  APP_VERSION,
} from './common/constants';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformResponseInterceptor } from './common/interceptors/transform-response.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('port') || 4000;
  const frontendUrl =
    configService.get<string>('frontendUrl') || 'http://localhost:3000';

  // 1. Global Prefix
  app.setGlobalPrefix(API_PREFIX);

  // 2. CORS
  app.enableCors({
    origin: [frontendUrl, 'http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // 3. Global Validation Pipe
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

  // 4. Global Filters & Interceptors
  const reflector = app.get(Reflector);
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformResponseInterceptor(reflector),
  );

  // 5. Swagger API Documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle(APP_NAME)
    .setDescription(APP_DESCRIPTION)
    .setVersion(APP_VERSION)
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(`${API_PREFIX}/docs`, app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // 6. Start Server
  await app.listen(port);
  logger.log(`BizPro+ Backend running at: http://localhost:${port}/${API_PREFIX}`);
  logger.log(
    `Swagger documentation accessible at: http://localhost:${port}/${API_PREFIX}/docs`,
  );
}

bootstrap();
