import { Role } from '@domain/entities/role.entity';
import { IRoleRepository } from '@domain/repositories/role.repository.interface';
import { IPermissionRepository } from '@domain/repositories/permission.repository.interface';
import { NotFoundException } from '@shared/exceptions/not-found.exception';
import { ValidationException } from '@shared/exceptions/validation.exception';

export class UpdateRoleUseCase {
  constructor(
    private readonly roleRepository: IRoleRepository,
    private readonly permissionRepository: IPermissionRepository,
  ) {}

  async execute(
    id: string,
    name: string,
    description: string,
    permissionSymbols: string[],
  ): Promise<Role> {
    const role = await this.roleRepository.findById(id);
    if (!role) {
      throw new NotFoundException('Role', id);
    }

    const permissions = await this.permissionRepository.findBySymbols(
      permissionSymbols,
    );

    if (permissions.length !== permissionSymbols.length) {
      throw new ValidationException({
        permissionSymbols: ['One or more permission symbols are invalid'],
      });
    }

    role.updateDetails(name, description);
    role.permissions = permissions;

    return this.roleRepository.update(role);
  }
}

