import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AssignRoleToUserUseCase } from '@application/use-cases/role/assign-role-to-user.use-case';
import { ListUserRolesUseCase } from '@application/use-cases/role/list-user-roles.use-case';
import { RemoveRoleFromUserUseCase } from '@application/use-cases/role/remove-role-from-user.use-case';
import { RoleResponseDto } from '@presentation/dto/role/role-response.dto';
import { RoleDtoMapper } from '@presentation/mappers/role.dto-mapper';
import { Permissions } from '@shared/auth/permissions.decorator';
import { PermissionsGuard } from '@shared/auth/permissions.guard';

@ApiTags('User Roles')
@ApiBearerAuth()
@Controller('api/users/:userId/roles')
@UseGuards(PermissionsGuard)
export class UserRoleController {
  constructor(
    private readonly assignRoleToUserUseCase: AssignRoleToUserUseCase,
    private readonly removeRoleFromUserUseCase: RemoveRoleFromUserUseCase,
    private readonly listUserRolesUseCase: ListUserRolesUseCase,
  ) {}

  @Post(':roleId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Permissions('role.assign')
  @ApiOperation({ summary: 'Assign role to user' })
  @ApiResponse({ status: 204 })
  async assignRole(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Param('roleId', new ParseUUIDPipe()) roleId: string,
  ): Promise<void> {
    await this.assignRoleToUserUseCase.execute(userId, roleId);
  }

  @Delete(':roleId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Permissions('role.assign')
  @ApiOperation({ summary: 'Delete role assignment from user' })
  @ApiResponse({ status: 204 })
  async removeRole(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Param('roleId', new ParseUUIDPipe()) roleId: string,
  ): Promise<void> {
    await this.removeRoleFromUserUseCase.execute(userId, roleId);
  }

  @Get()
  @ApiOperation({ summary: 'List roles of a user' })
  @ApiResponse({ status: 200, type: [RoleResponseDto] })
  async listRoles(
    @Param('userId', new ParseUUIDPipe()) userId: string,
  ): Promise<RoleResponseDto[]> {
    const roles = await this.listUserRolesUseCase.execute(userId);
    return RoleDtoMapper.toResponseList(roles);
  }
}

