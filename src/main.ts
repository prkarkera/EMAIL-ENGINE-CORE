import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  // Create NestJS application
  const app = await NestFactory.create(AppModule);

  // Enable CORS for cross-origin requests
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  // Use global validation pipe for request validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip unwanted properties from requests
      forbidNonWhitelisted: true, // Throw error for extra properties
      transform: true, // Automatically transform payloads to DTOs
    }),
  );

  // Start the application on the specified port
  const port = 5000;
  await app.listen(port);

  console.log(`Application is running on: http://localhost:${port}`);
}

bootstrap();
