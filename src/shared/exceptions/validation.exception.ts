// Validation exception - when input validation fails

import { DomainException } from './domain.exception';

export class ValidationException extends DomainException {
  constructor(public readonly errors: Record<string, string[]>) {
    super('VALIDATION_ERROR', 'Validation failed');
    this.name = 'ValidationException';
  }
}
