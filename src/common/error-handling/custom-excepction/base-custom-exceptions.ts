import { ErrorResponseInterface } from '../error-response.interface.js';

export abstract class BaseCustomException extends Error {
  abstract status: number;
  protected constructor(message: string) {
    super(message);
  }
  formatError(): ErrorResponseInterface {
    return { message: this.message };
  }
}
