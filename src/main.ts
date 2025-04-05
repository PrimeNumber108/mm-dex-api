import { ValidationPipe, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
// import * as compression from 'compression';
// import * as cookieParser from 'cookie-parser';
// import cookieParser from 'cookie-parser';

import helmet from 'helmet';
import { join } from 'path';

import { env } from './config';
import { AppModule } from './modules/app.module';

const morgan = require('morgan');  // CommonJS require
const compression = require('compression');
const cookieParser = require('cookie-parser');


const setMiddleware = (app: NestExpressApplication) => {
  app.use(helmet());

  app.enableCors({
    credentials: true,
    // origin: (_, callback) => callback(null, true),
    origin: (origin, callback) => {
      const allowedOrigins = ['http://localhost:5173', 'https://mm-hcm.the20.sg']; // Ensure both localhost and production origins are allowed
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    allowedHeaders: [
      '*',
      'Authorization',
      'Content-Type',
      'X-Requested-With',
      'x-api-secret',
      'username'
    ],
  });

  app.use(morgan('combined'));

  app.use(compression());

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
};

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: new Logger('[]'),
  });
  app.useLogger(new Logger('APP'));
  const logger = new Logger('APP');

  app.setGlobalPrefix('api');
  setMiddleware(app);

  if (process.env.NODE_ENV !== 'production') {
    const swaggerConfig = new DocumentBuilder()
    .addServer('http://localhost:3000')  // 👈 Force Swagger to use the backend URL
      .addApiKey(
        { type: 'apiKey', name: 'x-api-secret', in: 'header' },
        'x-api-secret'
      )
      .addApiKey(
        { type: 'apiKey', name: 'username', in: 'header' },
        'username'
      )
      .build();


    const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('swagger', app, swaggerDocument, {
      jsonDocumentUrl: 'swagger/json',
      customCss: `
      .swagger-ui .topbar { display: none !important; } /* Hide Swagger UI title */
      .swagger-ui .swagger-ui-footer { display: none !important; } /* Hide "Supported by Swagger" */
    `
    });
  }

  await app.listen(env.port, () =>
    logger.warn(`> Listening App on port ${env.port}`),
  );

}

bootstrap();
