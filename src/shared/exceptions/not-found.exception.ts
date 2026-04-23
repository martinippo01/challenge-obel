// Not found exception - when resource doesn't exist

import { DomainException } from './domain.exception';

export class NotFoundException extends DomainException {
  constructor(entity: string, identifier?: string) {
    const message = identifier
      ? `${entity} with identifier "${identifier}" not found`
      : `${entity} not found`;
    super('NOT_FOUND', message);
    this.name = 'NotFoundException';
  }
}
