// Global HTTP exception filter - catches exceptions and returns proper HTTP status codes

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { DomainException } from '../exceptions/domain.exception';
import { NotFoundException } from '../exceptions/not-found.exception';
import { ConflictException } from '../exceptions/conflict.exception';
import { ValidationException } from '../exceptions/validation.exception';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('HttpExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code = 'INTERNAL_SERVER_ERROR';
    let errors: Record<string, string[]> | undefined;

    if (exception instanceof NotFoundException) {
      statusCode = HttpStatus.NOT_FOUND;
      message = exception.message;
      code = exception.code;
    } else if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const response = exception.getResponse() as
        | string
        | { message?: string | string[]; error?: string };

      if (typeof response === 'string') {
        message = response;
      } else if (Array.isArray(response?.message)) {
        message = response.message.join(', ');
      } else if (response?.message) {
        message = response.message;
      } else {
        message = exception.message;
      }

      code = response && typeof response !== 'string' && response.error
        ? response.error.toUpperCase().replace(/\s+/g, '_')
        : 'HTTP_EXCEPTION';
    } else if (exception instanceof ConflictException) {
      statusCode = HttpStatus.CONFLICT;
      message = exception.message;
      code = exception.code;
    } else if (exception instanceof ValidationException) {
      statusCode = HttpStatus.BAD_REQUEST;
      message = exception.message;
      code = exception.code;
      errors = exception.errors;
    } else if (exception instanceof DomainException) {
      statusCode = HttpStatus.BAD_REQUEST;
      message = exception.message;
      code = exception.code;
    } else if (exception instanceof Error) {
      this.logger.error(
        `Unhandled error: ${exception.message}`,
        exception.stack,
      );
      message = exception.message || 'Internal server error';
    }

    const errorResponse = {
      statusCode,
      code,
      message,
      ...(errors && { errors }),
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(statusCode).json(errorResponse);
  }
}
