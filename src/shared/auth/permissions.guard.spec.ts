import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { PermissionsGuard } from './permissions.guard';

describe('PermissionsGuard', () => {
  it('allows request when all required permissions are present', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(['role.write']),
    } as unknown as Reflector;

    const guard = new PermissionsGuard(reflector);

    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({
          auth: {
            permissions: ['role.read', 'role.write'],
          },
        }),
      }),
    } as unknown as ExecutionContext;

    expect(guard.canActivate(context)).toBe(true);
  });

  it('denies request when required permission is missing', () => {
    const reflector = {
      getAllAndOverride: jest.fn().mockReturnValue(['role.assign']),
    } as unknown as Reflector;

    const guard = new PermissionsGuard(reflector);

    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({
          auth: {
            permissions: ['role.read'],
          },
        }),
      }),
    } as unknown as ExecutionContext;

    expect(() => guard.canActivate(context)).toThrow(
      'Insufficient permissions for this action',
    );
  });
});

