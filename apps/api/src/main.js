


import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Parse cookies (required for httpOnly refresh token cookie)
  app.use(cookieParser());

  // Setup Global Exception Filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Setup Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    })
  );

  // Setup Global API Prefix
  app.setGlobalPrefix('api');

  // Setup CORS with credentials
  const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:3000';
  app.enableCors({
    origin: allowedOrigin,
    credentials: true,
  });

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}/api`);
}
bootstrap();
