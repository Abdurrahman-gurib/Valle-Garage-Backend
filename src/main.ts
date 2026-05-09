import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: configService.get('FRONTEND_URL') || true,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Vallé GMS API')
    .setDescription(
      'Interactive API documentation for Vallé Garage Management System. Use POST /api/auth/login first, then click Authorize and paste the accessToken.',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Paste only the JWT accessToken. Swagger will add Bearer automatically.',
        in: 'header',
      },
      'bearer',
    )
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup('api/docs', app, swaggerDocument, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      displayRequestDuration: true,
    },
    customSiteTitle: 'Vallé GMS API Docs',
  });

  app.getHttpAdapter().getInstance().get('/api', (_req, res) => {
    res.redirect('/api/docs');
  });

  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);

  console.log(`Vallé GMS API running on http://localhost:${port}/api`);
  console.log(`Swagger Docs running on http://localhost:${port}/api/docs`);
}

bootstrap();
