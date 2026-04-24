import { Entity, PrimaryColumn, CreateDateColumn } from 'typeorm';

@Entity('user_roles')
export class UserRoleOrmEntity {
  @PrimaryColumn('uuid')
  userId: string;

  @PrimaryColumn('uuid')
  roleId: string;

  @CreateDateColumn()
  createdAt: Date;
}

