import { ArrayMinSize, IsArray, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({ example: 'manager' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Manager role with user assignment capabilities' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    example: ['role.read', 'role.assign'],
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  permissionSymbols: string[];
}

