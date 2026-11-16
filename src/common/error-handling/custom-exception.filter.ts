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
import { formatInputValidationErrors } from './input-validation/format-input-validation-errors.js';

@Catch()
export class CustomExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(CustomExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // 1) Custom domain exception (e.g., NotFoundException, BadRequestException, etc.)
    if (exception instanceof BaseCustomException) {
      return response.status(exception.status).json({
        errors: [exception.formatError()],
      });
    }

    // 2) NestJS HttpException (including ValidationPipe)
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const resObj = exceptionResponse as any;
        if (Array.isArray(resObj.message)) {
          const errors = resObj.message.map((msg: string) => ({ message: msg }));
          return response.status(status).json({ errors });
        }
        if (resObj.errors) {
          return response.status(status).json({ errors: resObj.errors });
        }
        if (resObj.message) {
          return response.status(status).json({ errors: [{ message: resObj.message }] });
        }
      }

      return response.status(status).json({
        errors: [{ message: exception.message }],
      });
    }

    // 3) Mongo duplicate key error (code 11000)
    if (exception?.code === 11000) {
      const field = Object.keys(exception.keyValue || {})[0] || 'field';
      return response.status(HttpStatus.BAD_REQUEST).json({
        errors: [{ message: `${field} already exists`, field }],
      });
    }

    // 4) Fallback unhandled error
    this.logger.error('Unhandled Exception:', exception);
    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      errors: [{ message: exception?.message || 'Internal Server Error' }],
    });
  }
}
