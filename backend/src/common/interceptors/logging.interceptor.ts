import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    const method = req?.method || 'UNKNOWN';
    const url = req?.originalUrl || req?.url || '';
    const now = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const statusCode = res?.statusCode || 200;
          const delay = Date.now() - now;
          this.logger.log(`[${method}] ${url} ${statusCode} - ${delay}ms`);
        },
        error: (error) => {
          const statusCode = error?.status || 500;
          const delay = Date.now() - now;
          this.logger.warn(`[${method}] ${url} ${statusCode} - ${delay}ms - ${error?.message || error}`);
        },
      }),
    );
  }
}
