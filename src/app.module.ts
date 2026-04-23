// Root Application Module
// Imports and configures all feature modules

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { databaseConfig } from '@config/database.config';
import { UserModule } from '@modules/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    databaseConfig,
    UserModule,
  ],
})
export class AppModule {}
