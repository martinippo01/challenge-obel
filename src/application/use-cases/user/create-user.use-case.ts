// Application Layer - Create User Use Case
// Handles the business logic for creating a new user

import { Injectable } from '@nestjs/common';
import { User } from '@domain/entities/user.entity';
import { IUserRepository } from '@domain/repositories/user.repository.interface';
import { v4 as uuidv4 } from 'uuid';
import { ConflictException } from '@shared/exceptions/conflict.exception';

export class CreateUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(
    email: string,
    firstName: string,
    lastName: string,
    password: string,
  ): Promise<User> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Create new user
    const id = uuidv4();
    const now = new Date();
    const newUser = new User(
      id,
      email,
      firstName,
      lastName,
      password,
      true,
      now,
      now,
    );

    // Save to repository
    return await this.userRepository.save(newUser);
  }
}
