import { Role } from '@domain/entities/role.entity';
import { IUserRepository } from '@domain/repositories/user.repository.interface';
import { IUserRoleRepository } from '@domain/repositories/user-role.repository.interface';
import { NotFoundException } from '@shared/exceptions/not-found.exception';

export class ListUserRolesUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly userRoleRepository: IUserRoleRepository,
  ) {}

  async execute(userId: string): Promise<Role[]> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User', userId);
    }

    return this.userRoleRepository.listRolesByUserId(userId);
  }
}

