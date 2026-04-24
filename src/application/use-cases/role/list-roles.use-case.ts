import { Role } from '@domain/entities/role.entity';
import { IRoleRepository } from '@domain/repositories/role.repository.interface';

export class ListRolesUseCase {
  constructor(private readonly roleRepository: IRoleRepository) {}

  async execute(): Promise<Role[]> {
    return this.roleRepository.findAll();
  }
}

