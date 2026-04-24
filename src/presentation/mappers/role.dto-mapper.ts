import { Role } from '@domain/entities/role.entity';
import { RoleResponseDto } from '@presentation/dto/role/role-response.dto';

export class RoleDtoMapper {
  static toResponse(role: Role): RoleResponseDto {
    return {
      id: role.id,
      name: role.name,
      description: role.description,
      permissionSymbols: role.permissions.map((permission) => permission.symbol),
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    };
  }

  static toResponseList(roles: Role[]): RoleResponseDto[] {
    return roles.map((role) => this.toResponse(role));
  }
}

