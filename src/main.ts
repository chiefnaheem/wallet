import {
  BadRequestException,
  UnauthorizedException,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as compression from 'compression';
import * as dotenv from 'dotenv';
import * as express from 'express';
import { WinstonModule } from 'nest-winston';
import { AppModule } from './app.module';
import serverConfig from './server/config/env.config';
import { loggerConfig } from './server/config/logger.config';
import { swaggerTags } from './server/config/swagger.config';
import { SlackService } from './slack/slack.service';
import {
  readNotifiedEndpoints,
  writeNotifiedEndpoints,
} from './utils/helpers/notification-file-utils';
import { HttpExceptionFilter } from './slack/http-exception.filter';
import { ConfigService } from '@nestjs/config';

dotenv.config();

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: WinstonModule.createLogger(loggerConfig),
  });

  // Enable CORS for all origins and allow necessary headers
  app.enableCors({
    origin: '*', // Allow all origins
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
    credentials: true, // Set to true if you need to include cookies or authentication
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // Enable compression for all responses
  app.use(compression());
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  app.setGlobalPrefix('/api');

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.disable('x-powered-by');

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        // enableImplicitConversion: true,
      },
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (validationErrors = []) => {
        // console.error('Validation errors:', validationErrors);
        return new BadRequestException(
          validationErrors.map((error) => ({
            property: error.property,
            constraints: error.constraints,
            value: error.value,
            children: error.children,
          })),
        );
      },
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('GOWAGR')
    .setDescription("The Alpharide's API Documentation.")
    .setVersion('1.0.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'Bearer',
    )
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'refresh-token',
    )
    .addApiKey(
      {
        type: 'apiKey',
        name: 'x-api-key',
        in: 'header',
      },
      'api-key',
    )
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig, {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  });

  const appTags = swaggerTags();

  appTags.forEach((tag) => {
    swaggerDocument.tags.push({
      name: tag.name,
      description: tag.description,
    });
  });

  SwaggerModule.setup('api/docs', app, swaggerDocument);

  const port = serverConfig.PORT;

  await app
    .listen(port)
    .then(() => console.log(`Server running on port ${port}`))
    .catch((err) => console.log(err));
}
bootstrap();
