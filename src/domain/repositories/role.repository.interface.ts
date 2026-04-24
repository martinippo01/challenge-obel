import { Role } from '@domain/entities/role.entity';

export interface IRoleRepository {
  save(role: Role): Promise<Role>;
  update(role: Role): Promise<Role>;
  findById(id: string): Promise<Role | null>;
  findByName(name: string): Promise<Role | null>;
  findAll(): Promise<Role[]>;
}

