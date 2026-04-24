import { ArrayMinSize, IsArray, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateRoleDto {
  @ApiProperty({ example: 'manager' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Updated manager role description' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    example: ['role.read', 'role.write', 'role.assign'],
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  permissionSymbols: string[];
}

