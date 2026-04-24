import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { PERMISSIONS_KEY } from './permissions.decorator';
import { AuthContext } from './auth-context.interface';

interface RequestWithAuth extends Request {
  auth?: AuthContext;
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithAuth>();
    const grantedPermissions = request.auth?.permissions ?? [];

    const isAllowed = requiredPermissions.every((permission) =>
      grantedPermissions.includes(permission),
    );

    if (!isAllowed) {
      throw new ForbiddenException('Insufficient permissions for this action');
    }

    return true;
  }
}


