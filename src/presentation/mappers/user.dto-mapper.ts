// Presentation Layer - User Mapper (DTO)
// Converts between Domain User and Response DTOs

import { User } from '@domain/entities/user.entity';
import { UserResponseDto } from '../dto/user/user-response.dto';

export class UserDtoMapper {
  static toResponse(user: User): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = user.id;
    dto.email = user.email;
    dto.firstName = user.firstName;
    dto.lastName = user.lastName;
    dto.fullName = user.getFullName();
    dto.isActive = user.isActive;
    dto.createdAt = user.createdAt;
    dto.updatedAt = user.updatedAt;
    return dto;
  }

  static toResponseList(users: User[]): UserResponseDto[] {
    return users.map((user) => this.toResponse(user));
  }
}
