import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Permission } from '@domain/entities/permission.entity';
import { IPermissionRepository } from '@domain/repositories/permission.repository.interface';
import { PermissionOrmEntity } from '../entities/permission.orm-entity';
import { RoleMapper } from './mappers/role.mapper';

@Injectable()
export class PermissionRepositoryImpl implements IPermissionRepository {
  constructor(
    @InjectRepository(PermissionOrmEntity)
    private readonly permissionOrmRepository: Repository<PermissionOrmEntity>,
  ) {}

  async findBySymbols(symbols: string[]): Promise<Permission[]> {
    if (symbols.length === 0) {
      return [];
    }

    const permissions = await this.permissionOrmRepository.find({
      where: { symbol: In(symbols) },
    });

    return permissions.map((permission) => RoleMapper.permissionToDomain(permission));
  }
}

