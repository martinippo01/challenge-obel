import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateRolesAndPermissions1713817400000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    await queryRunner.createTable(
      new Table({
        name: 'roles',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'description',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'permissions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'symbol',
            type: 'varchar',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'description',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'role_permissions',
        columns: [
          {
            name: 'roleId',
            type: 'uuid',
            isPrimary: true,
            isNullable: false,
          },
          {
            name: 'permissionId',
            type: 'uuid',
            isPrimary: true,
            isNullable: false,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'user_roles',
        columns: [
          {
            name: 'userId',
            type: 'uuid',
            isPrimary: true,
            isNullable: false,
          },
          {
            name: 'roleId',
            type: 'uuid',
            isPrimary: true,
            isNullable: false,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
    );

    await queryRunner.createForeignKeys('role_permissions', [
      new TableForeignKey({
        columnNames: ['roleId'],
        referencedTableName: 'roles',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
      new TableForeignKey({
        columnNames: ['permissionId'],
        referencedTableName: 'permissions',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    ]);

    await queryRunner.createForeignKeys('user_roles', [
      new TableForeignKey({
        columnNames: ['userId'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
      new TableForeignKey({
        columnNames: ['roleId'],
        referencedTableName: 'roles',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    ]);

    await queryRunner.createIndices('role_permissions', [
      new TableIndex({ name: 'IDX_role_permissions_roleId', columnNames: ['roleId'] }),
      new TableIndex({
        name: 'IDX_role_permissions_permissionId',
        columnNames: ['permissionId'],
      }),
    ]);

    await queryRunner.createIndices('user_roles', [
      new TableIndex({ name: 'IDX_user_roles_userId', columnNames: ['userId'] }),
      new TableIndex({ name: 'IDX_user_roles_roleId', columnNames: ['roleId'] }),
    ]);

    await queryRunner.query(`
      INSERT INTO "permissions" ("id", "symbol", "description", "createdAt", "updatedAt") VALUES
      ('6d977f35-7b71-4b80-8cf6-dda9818d0101', 'role.read', 'Read roles and user-role assignments', NOW(), NOW()),
      ('6d977f35-7b71-4b80-8cf6-dda9818d0102', 'role.write', 'Create and update roles', NOW(), NOW()),
      ('6d977f35-7b71-4b80-8cf6-dda9818d0103', 'role.assign', 'Assign or remove roles from users', NOW(), NOW())
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('user_roles', true);
    await queryRunner.dropTable('role_permissions', true);
    await queryRunner.dropTable('permissions', true);
    await queryRunner.dropTable('roles', true);
  }
}


