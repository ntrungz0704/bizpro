import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BYPASS_TRANSFORM_KEY } from '../constants';

export interface SuccessResponseEnvelope<T> {
  success: true;
  statusCode: number;
  data: T;
  timestamp: string;
}

@Injectable()
export class TransformResponseInterceptor<T>
  implements NestInterceptor<T, SuccessResponseEnvelope<T> | T>
{
  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<SuccessResponseEnvelope<T> | T> {
    const isBypassed = this.reflector.getAllAndOverride<boolean>(
      BYPASS_TRANSFORM_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (isBypassed) {
      return next.handle();
    }

    const response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      map((data) => {
        // Prevent double wrapping if data already has envelope structure
        if (
          data !== null &&
          typeof data === 'object' &&
          'success' in data &&
          'timestamp' in data
        ) {
          return data;
        }

        const statusCode = response ? response.statusCode : 200;

        return {
          success: true,
          statusCode,
          data: data !== undefined ? data : null,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
