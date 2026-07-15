import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { envs } from './config/envs';

async function bootstrap() {
  const logger = new Logger('DIAGNOSIS_SERVICE_HTTP');

  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
    methods: 'GET,POST,PATCH,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const port = process.env.PORT || envs.port || 3003;

  await app.listen(port, '0.0.0.0');

  logger.log(`Diagnosis HTTP service running on port ${port}`);
}

bootstrap();
