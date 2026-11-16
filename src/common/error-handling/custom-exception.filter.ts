import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { BaseCustomException } from './custom-excepction/base-custom-exceptions.js';
import { ErrorResponseInterface } from './error-response.interface.js';

@Catch()
export class CustomExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(CustomExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    // Only HTTP is handled here; websocket errors are handled by the gateway.
    if (host.getType() !== 'http') {
      this.logger.error(exception?.message ?? exception);
      return;
    }

    const response = host.switchToHttp().getResponse<Response>();
    const send = (status: number, errors: ErrorResponseInterface[]) =>
      response.status(status).json({ errors });

    // 1) Custom domain exceptions
    if (exception instanceof BaseCustomException) {
      return send(exception.status, [exception.formatError()]);
    }

    // 2) NestJS HttpException (ValidationPipe, throttler, multer, ...)
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse() as any;

      if (res && typeof res === 'object') {
        if (Array.isArray(res.errors)) return send(status, res.errors);
        if (Array.isArray(res.message)) {
          return send(status, res.message.map((message: string) => ({ message })));
        }
        if (res.message) return send(status, [{ message: res.message }]);
      }
      return send(status, [{ message: exception.message }]);
    }

    // 3) Multer errors (file too large, too many files, ...)
    if (exception?.name === 'MulterError') {
      return send(HttpStatus.BAD_REQUEST, [
        { field: exception.field, message: exception.message },
      ]);
    }

    // 4) Mongoose schema validation
    if (exception?.name === 'ValidationError' && exception.errors) {
      const errors = Object.values<any>(exception.errors).map((e) => ({
        field: e.path,
        message: e.message,
      }));
      return send(HttpStatus.BAD_REQUEST, errors);
    }

    // 5) Malformed ObjectId / cast failures
    if (exception?.name === 'CastError') {
      return send(HttpStatus.BAD_REQUEST, [
        { field: exception.path, message: `Invalid value for ${exception.path}` },
      ]);
    }

    // 6) Mongo duplicate key
    if (exception?.code === 11000) {
      const field = Object.keys(exception.keyValue || {})[0] || 'field';
      return send(HttpStatus.CONFLICT, [{ field, message: `${field} already exists` }]);
    }

    // 7) Unknown error: log it, never leak internals in production
    this.logger.error(exception?.message ?? exception, exception?.stack);
    const message =
      process.env.NODE_ENV === 'production'
        ? 'Something went wrong, please try again later'
        : exception?.message || 'Internal Server Error';
    return send(HttpStatus.INTERNAL_SERVER_ERROR, [{ message }]);
  }
}
