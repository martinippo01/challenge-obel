// Conflict exception - when resource state creates conflict (e.g., duplicate email)

import { DomainException } from './domain.exception';

export class ConflictException extends DomainException {
  constructor(message: string) {
    super('CONFLICT', message);
    this.name = 'ConflictException';
  }
}
