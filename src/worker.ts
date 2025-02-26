import { Logger } from '@nestjs/common';
import { WorkerModule } from './modules/worker/worker.module';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { env } from './config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(WorkerModule, {
    logger: new Logger('[]'),
  });

  app.setGlobalPrefix('api');
  if (process.env.NODE_ENV !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('A8 Pump Fun Worker')
      .setVersion('0.0.12')
      .build();

    const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('swagger', app, swaggerDocument, {
      jsonDocumentUrl: 'swagger/json',
    });
  }

  const logger = new Logger('WorkerApp');
  app.useLogger(logger);
  await app.listen(env.workerPort, () =>
    Logger.warn(`> Listening on port ${env.workerPort}`),
  );
}

bootstrap();
