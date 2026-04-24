import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NextFunction, Request, Response } from 'express';
import { AuthContext } from '@shared/auth/auth-context.interface';

interface RequestWithAuth extends Request {
  auth?: AuthContext;
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly configService: ConfigService) {}

  use(req: RequestWithAuth, _res: Response, next: NextFunction): void {
    const authorization = req.headers.authorization;
    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw new UnauthorizedException('Authorization header is required');
    }

    const token = authorization.replace('Bearer ', '').trim();
    if (!token) {
      throw new UnauthorizedException('Bearer token is required');
    }

    const adminToken = this.configService.get<string>('AUTH_TOKEN', 'dev-admin-token');
    const readerToken = this.configService.get<string>(
      'AUTH_READ_TOKEN',
      'dev-read-token',
    );

    if (token === adminToken) {
      req.auth = {
        token,
        permissions: ['role.read', 'role.write', 'role.assign'],
      };
      next();
      return;
    }

    if (token === readerToken) {
      req.auth = {
        token,
        permissions: ['role.read'],
      };
      next();
      return;
    }

    throw new UnauthorizedException('Invalid authorization token');
  }
}

