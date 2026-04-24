import { Entity, PrimaryColumn, CreateDateColumn } from 'typeorm';

@Entity('role_permissions')
export class RolePermissionOrmEntity {
  @PrimaryColumn('uuid')
  roleId: string;

  @PrimaryColumn('uuid')
  permissionId: string;

  @CreateDateColumn()
  createdAt: Date;
}

