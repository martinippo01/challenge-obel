import { DataSourceOptions } from 'typeorm';
import { resolve } from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const config: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'nestjs_clean_arch',
  entities: [resolve(__dirname, './src/infrastructure/persistence/entities/*{.ts,.js}')],
  migrations: [resolve(__dirname, './src/database/migrations/*{.ts,.js}')],
  synchronize: false,
  logging: true,
};

export default config;
