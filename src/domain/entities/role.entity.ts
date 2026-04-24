import { Permission } from './permission.entity';

export class Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  createdAt: Date;
  updatedAt: Date;

  constructor(
    id: string,
    name: string,
    description: string,
    permissions: Permission[],
    createdAt: Date,
    updatedAt: Date,
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.permissions = permissions;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  updateDetails(name: string, description: string): void {
    this.name = name;
    this.description = description;
    this.updatedAt = new Date();
  }
}

