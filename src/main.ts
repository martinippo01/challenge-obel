// Main Application Bootstrap

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from '@shared/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Register global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Enable validation globally
  app.useGlobalPipes(new ValidationPipe());

  // Enable CORS - for this proof-of-concept allow all origins so the API
  // is directly accessible from Postman or any client. Using `origin: true`
  // reflects the request origin, which works with `credentials: true` if
  // needed. In production you should restrict this to trusted origins.
  app.enableCors({
    origin: true,
    credentials: true,
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`Application is running on: http://localhost:${port}`);
}

bootstrap();
