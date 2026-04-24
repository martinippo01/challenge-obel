import { Role } from '@domain/entities/role.entity';

export interface IUserRoleRepository {
  assignRoleToUser(userId: string, roleId: string): Promise<void>;
  removeRoleFromUser(userId: string, roleId: string): Promise<void>;
  listRolesByUserId(userId: string): Promise<Role[]>;
  userHasRole(userId: string, roleId: string): Promise<boolean>;
}

