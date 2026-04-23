// Infrastructure Layer - User Mapper
// Converts between Domain User and ORM Entity

import { User } from '@domain/entities/user.entity';
import { UserOrmEntity } from '../../entities/user.orm-entity';

export class UserMapper {
  static toDomain(raw: UserOrmEntity): User {
    return new User(
      raw.id,
      raw.email,
      raw.firstName,
      raw.lastName,
      raw.password,
      raw.isActive,
      raw.createdAt,
      raw.updatedAt,
    );
  }

  static toPersistence(user: User): UserOrmEntity {
    const ormEntity = new UserOrmEntity();
    ormEntity.id = user.id;
    ormEntity.email = user.email;
    ormEntity.firstName = user.firstName;
    ormEntity.lastName = user.lastName;
    ormEntity.password = user.password;
    ormEntity.isActive = user.isActive;
    ormEntity.createdAt = user.createdAt;
    ormEntity.updatedAt = user.updatedAt;
    return ormEntity;
  }
}
