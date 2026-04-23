// User Module
// Organizes User-related components (controllers, services, repositories)

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserOrmEntity } from '@infrastructure/persistence/entities/user.orm-entity';
import { UserRepositoryImpl } from '@infrastructure/persistence/repositories/user.repository.impl';
import { UserController } from '@presentation/controllers/user.controller';
import { CreateUserUseCase } from '@application/use-cases/user/create-user.use-case';
import { GetUserUseCase } from '@application/use-cases/user/get-user.use-case';
import { ListUsersUseCase } from '@application/use-cases/user/list-users.use-case';
import { UpdateUserUseCase } from '@application/use-cases/user/update-user.use-case';
import { DeleteUserUseCase } from '@application/use-cases/user/delete-user.use-case';
import { IUserRepository } from '@domain/repositories/user.repository.interface';

@Module({
  imports: [TypeOrmModule.forFeature([UserOrmEntity])],
  controllers: [UserController],
  providers: [
    // Repository implementation
    {
      provide: 'USER_REPOSITORY',
      useClass: UserRepositoryImpl,
    },
    // Use cases with dependency injection
    {
      provide: CreateUserUseCase,
      useFactory: (userRepository: UserRepositoryImpl) =>
        new CreateUserUseCase(userRepository),
      inject: ['USER_REPOSITORY'],
    },
    {
      provide: GetUserUseCase,
      useFactory: (userRepository: UserRepositoryImpl) =>
        new GetUserUseCase(userRepository),
      inject: ['USER_REPOSITORY'],
    },
    {
      provide: ListUsersUseCase,
      useFactory: (userRepository: UserRepositoryImpl) =>
        new ListUsersUseCase(userRepository),
      inject: ['USER_REPOSITORY'],
    },
    {
      provide: UpdateUserUseCase,
      useFactory: (userRepository: UserRepositoryImpl) =>
        new UpdateUserUseCase(userRepository),
      inject: ['USER_REPOSITORY'],
    },
    {
      provide: DeleteUserUseCase,
      useFactory: (userRepository: UserRepositoryImpl) =>
        new DeleteUserUseCase(userRepository),
      inject: ['USER_REPOSITORY'],
    },
  ],
  exports: ['USER_REPOSITORY'],
})
export class UserModule {}
