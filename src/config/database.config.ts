import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { resolve } from 'path';

export const databaseConfig = TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => ({
    type: 'postgres',
    host: configService.get('DB_HOST', 'localhost'),
    port: configService.get('DB_PORT', 5432),
    username: configService.get('DB_USERNAME', 'postgres'),
    password: configService.get('DB_PASSWORD', 'postgres'),
    database: configService.get('DB_NAME', 'nestjs_clean_arch'),
    entities: [resolve(__dirname, '../infrastructure/persistence/entities/*{.ts,.js}')],
    migrations: [resolve(__dirname, '../database/migrations/*{.ts,.js}')],
    synchronize: false, // Use migrations instead
    migrationsRun: true, // Run migrations on startup
    logging: true,
  }),
});
