import { Permission } from '@domain/entities/permission.entity';
import { Role } from '@domain/entities/role.entity';
import { PermissionOrmEntity } from '@infrastructure/persistence/entities/permission.orm-entity';
import { RoleOrmEntity } from '@infrastructure/persistence/entities/role.orm-entity';

export class RoleMapper {
  static permissionToDomain(permission: PermissionOrmEntity): Permission {
    return new Permission(
      permission.id,
      permission.symbol,
      permission.description,
      permission.createdAt,
      permission.updatedAt,
    );
  }

  static toDomain(entity: RoleOrmEntity, permissions: PermissionOrmEntity[]): Role {
    return new Role(
      entity.id,
      entity.name,
      entity.description,
      permissions.map((permission) => this.permissionToDomain(permission)),
      entity.createdAt,
      entity.updatedAt,
    );
  }

  static toPersistence(role: Role): RoleOrmEntity {
    const entity = new RoleOrmEntity();
    entity.id = role.id;
    entity.name = role.name;
    entity.description = role.description;
    entity.createdAt = role.createdAt;
    entity.updatedAt = role.updatedAt;
    return entity;
  }
}

