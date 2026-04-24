import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Role } from '@domain/entities/role.entity';
import { IRoleRepository } from '@domain/repositories/role.repository.interface';
import { IUserRoleRepository } from '@domain/repositories/user-role.repository.interface';
import { RoleOrmEntity } from '../entities/role.orm-entity';
import { PermissionOrmEntity } from '../entities/permission.orm-entity';
import { RolePermissionOrmEntity } from '../entities/role-permission.orm-entity';
import { UserRoleOrmEntity } from '../entities/user-role.orm-entity';
import { RoleMapper } from './mappers/role.mapper';

@Injectable()
export class RoleRepositoryImpl implements IRoleRepository, IUserRoleRepository {
  constructor(
    @InjectRepository(RoleOrmEntity)
    private readonly roleOrmRepository: Repository<RoleOrmEntity>,
    @InjectRepository(PermissionOrmEntity)
    private readonly permissionOrmRepository: Repository<PermissionOrmEntity>,
    @InjectRepository(RolePermissionOrmEntity)
    private readonly rolePermissionOrmRepository: Repository<RolePermissionOrmEntity>,
    @InjectRepository(UserRoleOrmEntity)
    private readonly userRoleOrmRepository: Repository<UserRoleOrmEntity>,
  ) {}

  async save(role: Role): Promise<Role> {
    const roleEntity = RoleMapper.toPersistence(role);
    await this.roleOrmRepository.save(roleEntity);
    await this.syncRolePermissions(role.id, role.permissions.map((p) => p.id));
    return this.findById(role.id) as Promise<Role>;
  }

  async update(role: Role): Promise<Role> {
    await this.roleOrmRepository.update(role.id, {
      name: role.name,
      description: role.description,
      updatedAt: new Date(),
    });
    await this.syncRolePermissions(role.id, role.permissions.map((p) => p.id));
    return this.findById(role.id) as Promise<Role>;
  }

  async findById(id: string): Promise<Role | null> {
    const roleEntity = await this.roleOrmRepository.findOne({ where: { id } });
    if (!roleEntity) {
      return null;
    }

    const permissions = await this.findPermissionsForRoleIds([id]);
    return RoleMapper.toDomain(roleEntity, permissions.get(id) ?? []);
  }

  async findByName(name: string): Promise<Role | null> {
    const roleEntity = await this.roleOrmRepository.findOne({ where: { name } });
    if (!roleEntity) {
      return null;
    }

    const permissions = await this.findPermissionsForRoleIds([roleEntity.id]);
    return RoleMapper.toDomain(roleEntity, permissions.get(roleEntity.id) ?? []);
  }

  async findAll(): Promise<Role[]> {
    const roleEntities = await this.roleOrmRepository.find({
      order: { name: 'ASC' },
    });

    if (roleEntities.length === 0) {
      return [];
    }

    const roleIds = roleEntities.map((role) => role.id);
    const permissionsByRoleId = await this.findPermissionsForRoleIds(roleIds);

    return roleEntities.map((roleEntity) =>
      RoleMapper.toDomain(roleEntity, permissionsByRoleId.get(roleEntity.id) ?? []),
    );
  }

  async assignRoleToUser(userId: string, roleId: string): Promise<void> {
    await this.userRoleOrmRepository
      .createQueryBuilder()
      .insert()
      .into(UserRoleOrmEntity)
      .values({ userId, roleId })
      .orIgnore()
      .execute();
  }

  async removeRoleFromUser(userId: string, roleId: string): Promise<void> {
    await this.userRoleOrmRepository.delete({ userId, roleId });
  }

  async listRolesByUserId(userId: string): Promise<Role[]> {
    const assignments = await this.userRoleOrmRepository.find({ where: { userId } });
    if (assignments.length === 0) {
      return [];
    }

    const roleIds = assignments.map((assignment) => assignment.roleId);
    const roleEntities = await this.roleOrmRepository.find({
      where: { id: In(roleIds) },
      order: { name: 'ASC' },
    });

    const permissionsByRoleId = await this.findPermissionsForRoleIds(roleIds);

    return roleEntities.map((roleEntity) =>
      RoleMapper.toDomain(roleEntity, permissionsByRoleId.get(roleEntity.id) ?? []),
    );
  }

  async userHasRole(userId: string, roleId: string): Promise<boolean> {
    const assignment = await this.userRoleOrmRepository.findOne({
      where: { userId, roleId },
    });
    return !!assignment;
  }

  private async findPermissionsForRoleIds(
    roleIds: string[],
  ): Promise<Map<string, PermissionOrmEntity[]>> {
    if (roleIds.length === 0) {
      return new Map();
    }

    const rolePermissions = await this.rolePermissionOrmRepository.find({
      where: { roleId: In(roleIds) },
    });

    if (rolePermissions.length === 0) {
      return new Map(roleIds.map((roleId) => [roleId, []]));
    }

    const permissionIds = [...new Set(rolePermissions.map((item) => item.permissionId))];
    const permissions = await this.permissionOrmRepository.find({
      where: { id: In(permissionIds) },
    });

    const permissionsById = new Map(permissions.map((permission) => [permission.id, permission]));
    const result = new Map<string, PermissionOrmEntity[]>();

    for (const roleId of roleIds) {
      result.set(roleId, []);
    }

    for (const rolePermission of rolePermissions) {
      const permission = permissionsById.get(rolePermission.permissionId);
      if (!permission) {
        continue;
      }

      const list = result.get(rolePermission.roleId);
      if (list) {
        list.push(permission);
      }
    }

    return result;
  }

  private async syncRolePermissions(
    roleId: string,
    permissionIds: string[],
  ): Promise<void> {
    await this.rolePermissionOrmRepository.delete({ roleId });

    if (permissionIds.length === 0) {
      return;
    }

    const values = permissionIds.map((permissionId) => ({ roleId, permissionId }));
    await this.rolePermissionOrmRepository.insert(values);
  }
}

