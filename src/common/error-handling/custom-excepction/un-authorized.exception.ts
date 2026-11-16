import { HttpStatus } from '@nestjs/common';
import { BaseCustomException } from './base-custom-exceptions.js';

export class UnAuthorizedException extends BaseCustomException {
  status = HttpStatus.UNAUTHORIZED;
  constructor(message: string) {
    super(message);
  }
}
