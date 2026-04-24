// Root Application Module
// Imports and configures all feature modules

import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { databaseConfig } from '@config/database.config';
import { UserModule } from '@modules/user.module';
import { RoleModule } from '@modules/role.module';
import { AuthMiddleware } from '@shared/middleware/auth.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    databaseConfig,
    UserModule,
    RoleModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(AuthMiddleware)
      .exclude(
        { path: 'docs', method: RequestMethod.ALL },
        { path: 'docs/(.*)', method: RequestMethod.ALL },
      )
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
