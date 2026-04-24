import { Permission } from '@domain/entities/permission.entity';

export interface IPermissionRepository {
  findBySymbols(symbols: string[]): Promise<Permission[]>;
}

