import {
  Controller,
  Get,
  INestApplication,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
  UseGuards,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { Permissions } from '@shared/auth/permissions.decorator';
import { PermissionsGuard } from '@shared/auth/permissions.guard';
import { AuthMiddleware } from '@shared/middleware/auth.middleware';

@Controller('api/test-auth')
@UseGuards(PermissionsGuard)
class TestAuthController {
  @Get('read')
  @Permissions('role.read')
  read(): { status: string } {
    return { status: 'ok' };
  }

  @Get('assign')
  @Permissions('role.assign')
  assign(): { status: string } {
    return { status: 'ok' };
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: true,
      load: [
        () => ({
          AUTH_TOKEN: 'admin-token',
          AUTH_READ_TOKEN: 'reader-token',
        }),
      ],
    }),
  ],
  controllers: [TestAuthController],
  providers: [PermissionsGuard],
})
class TestAuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(AuthMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}

describe('Auth integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [TestAuthModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns 401 when authorization header is missing', async () => {
    await request(app.getHttpServer()).get('/api/test-auth/read').expect(401);
  });

  it('returns 403 when reader token attempts role assignment action', async () => {
    await request(app.getHttpServer())
      .get('/api/test-auth/assign')
      .set('Authorization', 'Bearer reader-token')
      .expect(403);
  });
});




