import { ValidationError } from '@nestjs/common';
import { ErrorResponseInterface } from '../error-response.interface.js';

export function formatInputValidationErrors(
  errors: ValidationError[],
): ErrorResponseInterface[] {
  const result: ErrorResponseInterface[] = [];

  function extract(errorList: ValidationError[]) {
    for (const error of errorList) {
      if (error.constraints) {
        for (const message of Object.values(error.constraints)) {
          result.push({
            field: error.property,
            message,
          });
        }
      }
      if (error.children && error.children.length > 0) {
        extract(error.children);
      }
    }
  }

  extract(errors);
  return result;
}
