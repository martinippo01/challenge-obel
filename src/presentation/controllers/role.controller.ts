import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateRoleUseCase } from '@application/use-cases/role/create-role.use-case';
import { GetRoleUseCase } from '@application/use-cases/role/get-role.use-case';
import { ListRolesUseCase } from '@application/use-cases/role/list-roles.use-case';
import { UpdateRoleUseCase } from '@application/use-cases/role/update-role.use-case';
import { CreateRoleDto } from '@presentation/dto/role/create-role.dto';
import { UpdateRoleDto } from '@presentation/dto/role/update-role.dto';
import { RoleResponseDto } from '@presentation/dto/role/role-response.dto';
import { RoleDtoMapper } from '@presentation/mappers/role.dto-mapper';
import { Permissions } from '@shared/auth/permissions.decorator';
import { PermissionsGuard } from '@shared/auth/permissions.guard';

@ApiTags('Roles')
@ApiBearerAuth()
@Controller('api/roles')
@UseGuards(PermissionsGuard)
export class RoleController {
  constructor(
    private readonly createRoleUseCase: CreateRoleUseCase,
    private readonly getRoleUseCase: GetRoleUseCase,
    private readonly listRolesUseCase: ListRolesUseCase,
    private readonly updateRoleUseCase: UpdateRoleUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Permissions('role.write')
  @ApiOperation({ summary: 'Create a role' })
  @ApiResponse({ status: 201, type: RoleResponseDto })
  async create(@Body() dto: CreateRoleDto): Promise<RoleResponseDto> {
    const role = await this.createRoleUseCase.execute(
      dto.name,
      dto.description,
      dto.permissionSymbols,
    );

    return RoleDtoMapper.toResponse(role);
  }

  @Put(':id')
  @Permissions('role.write')
  @ApiOperation({ summary: 'Update a role' })
  @ApiResponse({ status: 200, type: RoleResponseDto })
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateRoleDto,
  ): Promise<RoleResponseDto> {
    const role = await this.updateRoleUseCase.execute(
      id,
      dto.name,
      dto.description,
      dto.permissionSymbols,
    );

    return RoleDtoMapper.toResponse(role);
  }

  @Get()
  @ApiOperation({ summary: 'List roles' })
  @ApiResponse({ status: 200, type: [RoleResponseDto] })
  async findAll(): Promise<RoleResponseDto[]> {
    const roles = await this.listRolesUseCase.execute();
    return RoleDtoMapper.toResponseList(roles);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get role by id' })
  @ApiResponse({ status: 200, type: RoleResponseDto })
  async findById(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<RoleResponseDto> {
    const role = await this.getRoleUseCase.execute(id);
    return RoleDtoMapper.toResponse(role);
  }
}

