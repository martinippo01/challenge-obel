import { Role } from '@domain/entities/role.entity';
import { IRoleRepository } from '@domain/repositories/role.repository.interface';
import { IPermissionRepository } from '@domain/repositories/permission.repository.interface';
import { ConflictException } from '@shared/exceptions/conflict.exception';
import { ValidationException } from '@shared/exceptions/validation.exception';
import { v4 as uuidv4 } from 'uuid';

export class CreateRoleUseCase {
  constructor(
    private readonly roleRepository: IRoleRepository,
    private readonly permissionRepository: IPermissionRepository,
  ) {}

  async execute(
    name: string,
    description: string,
    permissionSymbols: string[],
  ): Promise<Role> {
    const existingRole = await this.roleRepository.findByName(name);
    if (existingRole) {
      throw new ConflictException('Role with this name already exists');
    }

    const permissions = await this.permissionRepository.findBySymbols(
      permissionSymbols,
    );

    if (permissions.length !== permissionSymbols.length) {
      throw new ValidationException({
        permissionSymbols: ['One or more permission symbols are invalid'],
      });
    }

    const now = new Date();
    const role = new Role(uuidv4(), name, description, permissions, now, now);
    return this.roleRepository.save(role);
  }
}

