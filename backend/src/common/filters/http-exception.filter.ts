import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

export interface ErrorResponseEnvelope {
  success: false;
  statusCode: number;
  error: string;
  message: string | string[];
  timestamp: string;
  path: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let error = 'Internal Server Error';
    let message: string | string[] = 'An unexpected error occurred';

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        error = exception.name || 'Http Exception';
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const resObj = exceptionResponse as Record<string, unknown>;
        message = (resObj.message as string | string[]) || exception.message;
        error = (resObj.error as string) || exception.name;
      }
    } else if (exception instanceof Error) {
      this.logger.error(
        `Unhandled Exception: ${exception.message}`,
        exception.stack,
      );
      if (process.env.NODE_ENV !== 'production') {
        message = exception.message;
      }
    } else {
      this.logger.error(`Unknown Exception: ${JSON.stringify(exception)}`);
    }

    const errorPayload: ErrorResponseEnvelope = {
      success: false,
      statusCode,
      error,
      message,
      timestamp: new Date().toISOString(),
      path: request ? request.url : '',
    };

    response.status(statusCode).json(errorPayload);
  }
}
