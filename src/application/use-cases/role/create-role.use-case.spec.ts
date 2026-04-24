import { CreateRoleUseCase } from './create-role.use-case';
import { IRoleRepository } from '@domain/repositories/role.repository.interface';
import { IPermissionRepository } from '@domain/repositories/permission.repository.interface';
import { Permission } from '@domain/entities/permission.entity';
import { Role } from '@domain/entities/role.entity';
import { ConflictException } from '@shared/exceptions/conflict.exception';

describe('CreateRoleUseCase', () => {
  const permission = new Permission(
    'perm-1',
    'role.read',
    'Read roles',
    new Date(),
    new Date(),
  );

  const roleRepository: jest.Mocked<IRoleRepository> = {
    save: jest.fn(async (role: Role) => role),
    update: jest.fn(),
    findById: jest.fn(),
    findByName: jest.fn(),
    findAll: jest.fn(),
  };

  const permissionRepository: jest.Mocked<IPermissionRepository> = {
    findBySymbols: jest.fn(),
  };

  const useCase = new CreateRoleUseCase(roleRepository, permissionRepository);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a role when name is unique and permissions are valid', async () => {
    roleRepository.findByName.mockResolvedValue(null);
    permissionRepository.findBySymbols.mockResolvedValue([permission]);

    const role = await useCase.execute('analyst', 'Can read role data', [
      'role.read',
    ]);

    expect(role.name).toBe('analyst');
    expect(role.permissions).toHaveLength(1);
    expect(roleRepository.save).toHaveBeenCalledTimes(1);
  });

  it('throws conflict when role already exists', async () => {
    roleRepository.findByName.mockResolvedValue(
      new Role('role-1', 'analyst', 'Existing', [permission], new Date(), new Date()),
    );

    await expect(
      useCase.execute('analyst', 'Duplicated name', ['role.read']),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});

