import { HttpStatus } from '@nestjs/common';
import { BaseCustomException } from './base-custom-exceptions.js';

export class ForbidenException extends BaseCustomException {
  status = HttpStatus.FORBIDDEN;
  constructor(message: string) {
    super(message);
  }
}
