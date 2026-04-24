import { IUserRepository } from '@domain/repositories/user.repository.interface';
import { IRoleRepository } from '@domain/repositories/role.repository.interface';
import { IUserRoleRepository } from '@domain/repositories/user-role.repository.interface';
import { NotFoundException } from '@shared/exceptions/not-found.exception';

export class AssignRoleToUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly roleRepository: IRoleRepository,
    private readonly userRoleRepository: IUserRoleRepository,
  ) {}

  async execute(userId: string, roleId: string): Promise<void> {
    const [user, role] = await Promise.all([
      this.userRepository.findById(userId),
      this.roleRepository.findById(roleId),
    ]);

    if (!user) {
      throw new NotFoundException('User', userId);
    }

    if (!role) {
      throw new NotFoundException('Role', roleId);
    }

    await this.userRoleRepository.assignRoleToUser(userId, roleId);
  }
}

