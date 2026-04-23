// Infrastructure Layer - User Repository Implementation

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@domain/entities/user.entity';
import { IUserRepository } from '@domain/repositories/user.repository.interface';
import { UserOrmEntity } from '../entities/user.orm-entity';
import { UserMapper } from './mappers/user.mapper';

@Injectable()
export class UserRepositoryImpl implements IUserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly userOrmRepository: Repository<UserOrmEntity>,
  ) {}

  async save(user: User): Promise<User> {
    const ormEntity = UserMapper.toPersistence(user);
    const savedEntity = await this.userOrmRepository.save(ormEntity);
    return UserMapper.toDomain(savedEntity);
  }

  async findById(id: string): Promise<User | null> {
    const entity = await this.userOrmRepository.findOne({ where: { id } });
    return entity ? UserMapper.toDomain(entity) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const entity = await this.userOrmRepository.findOne({ where: { email } });
    return entity ? UserMapper.toDomain(entity) : null;
  }

  async update(user: User): Promise<User> {
    const ormEntity = UserMapper.toPersistence(user);
    await this.userOrmRepository.update(user.id, ormEntity);
    const updatedEntity = await this.userOrmRepository.findOne({
      where: { id: user.id },
    });
    return UserMapper.toDomain(updatedEntity!);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.userOrmRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async findAll(): Promise<User[]> {
    console.log('-----------------Fetching all users from the database...');
    const entities = await this.userOrmRepository.find();
    return entities.map(UserMapper.toDomain);
  }
}
