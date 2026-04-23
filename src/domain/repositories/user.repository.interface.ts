// Domain Layer - User Repository Interface
// Defines the contract for User persistence operations

import { User } from '../entities/user.entity';

export interface IUserRepository {
  save(user: User): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  update(user: User): Promise<User>;
  delete(id: string): Promise<boolean>;
  findAll(): Promise<User[]>;
}
