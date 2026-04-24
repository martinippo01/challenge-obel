import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreateRoleUseCase } from '@application/use-cases/role/create-role.use-case';
import { GetRoleUseCase } from '@application/use-cases/role/get-role.use-case';
import { ListRolesUseCase } from '@application/use-cases/role/list-roles.use-case';
import { UpdateRoleUseCase } from '@application/use-cases/role/update-role.use-case';
import { AssignRoleToUserUseCase } from '@application/use-cases/role/assign-role-to-user.use-case';
import { RemoveRoleFromUserUseCase } from '@application/use-cases/role/remove-role-from-user.use-case';
import { ListUserRolesUseCase } from '@application/use-cases/role/list-user-roles.use-case';
import { PermissionOrmEntity } from '@infrastructure/persistence/entities/permission.orm-entity';
import { RoleOrmEntity } from '@infrastructure/persistence/entities/role.orm-entity';
import { RolePermissionOrmEntity } from '@infrastructure/persistence/entities/role-permission.orm-entity';
import { UserRoleOrmEntity } from '@infrastructure/persistence/entities/user-role.orm-entity';
import { PermissionRepositoryImpl } from '@infrastructure/persistence/repositories/permission.repository.impl';
import { RoleRepositoryImpl } from '@infrastructure/persistence/repositories/role.repository.impl';
import { RoleController } from '@presentation/controllers/role.controller';
import { UserRoleController } from '@presentation/controllers/user-role.controller';
import { UserModule } from '@modules/user.module';
import { PermissionsGuard } from '@shared/auth/permissions.guard';
import { IUserRepository } from '@domain/repositories/user.repository.interface';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RoleOrmEntity,
      PermissionOrmEntity,
      RolePermissionOrmEntity,
      UserRoleOrmEntity,
    ]),
    UserModule,
  ],
  controllers: [RoleController, UserRoleController],
  providers: [
    {
      provide: 'ROLE_REPOSITORY',
      useClass: RoleRepositoryImpl,
    },
    {
      provide: 'PERMISSION_REPOSITORY',
      useClass: PermissionRepositoryImpl,
    },
    {
      provide: CreateRoleUseCase,
      useFactory: (
        roleRepository: RoleRepositoryImpl,
        permissionRepository: PermissionRepositoryImpl,
      ) => new CreateRoleUseCase(roleRepository, permissionRepository),
      inject: ['ROLE_REPOSITORY', 'PERMISSION_REPOSITORY'],
    },
    {
      provide: UpdateRoleUseCase,
      useFactory: (
        roleRepository: RoleRepositoryImpl,
        permissionRepository: PermissionRepositoryImpl,
      ) => new UpdateRoleUseCase(roleRepository, permissionRepository),
      inject: ['ROLE_REPOSITORY', 'PERMISSION_REPOSITORY'],
    },
    {
      provide: GetRoleUseCase,
      useFactory: (roleRepository: RoleRepositoryImpl) =>
        new GetRoleUseCase(roleRepository),
      inject: ['ROLE_REPOSITORY'],
    },
    {
      provide: ListRolesUseCase,
      useFactory: (roleRepository: RoleRepositoryImpl) =>
        new ListRolesUseCase(roleRepository),
      inject: ['ROLE_REPOSITORY'],
    },
    {
      provide: AssignRoleToUserUseCase,
      useFactory: (
        userRepository: IUserRepository,
        roleRepository: RoleRepositoryImpl,
      ) =>
        new AssignRoleToUserUseCase(userRepository, roleRepository, roleRepository),
      inject: ['USER_REPOSITORY', 'ROLE_REPOSITORY'],
    },
    {
      provide: RemoveRoleFromUserUseCase,
      useFactory: (
        userRepository: IUserRepository,
        roleRepository: RoleRepositoryImpl,
      ) =>
        new RemoveRoleFromUserUseCase(userRepository, roleRepository, roleRepository),
      inject: ['USER_REPOSITORY', 'ROLE_REPOSITORY'],
    },
    {
      provide: ListUserRolesUseCase,
      useFactory: (
        userRepository: IUserRepository,
        roleRepository: RoleRepositoryImpl,
      ) =>
        new ListUserRolesUseCase(userRepository, roleRepository),
      inject: ['USER_REPOSITORY', 'ROLE_REPOSITORY'],
    },
    PermissionsGuard,
  ],
  exports: ['ROLE_REPOSITORY'],
})
export class RoleModule {}


