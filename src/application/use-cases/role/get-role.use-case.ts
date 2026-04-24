import { Role } from '@domain/entities/role.entity';
import { IRoleRepository } from '@domain/repositories/role.repository.interface';
import { NotFoundException } from '@shared/exceptions/not-found.exception';

export class GetRoleUseCase {
  constructor(private readonly roleRepository: IRoleRepository) {}

  async execute(id: string): Promise<Role> {
    const role = await this.roleRepository.findById(id);
    if (!role) {
      throw new NotFoundException('Role', id);
    }

    return role;
  }
}

