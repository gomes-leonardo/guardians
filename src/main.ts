import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global Exception Filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('Guardians API')
    .setDescription(
      'API para gerenciamento de reservas de veículos. ' +
        'Permite cadastro de usuários, veículos e controle de reservas.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('users', 'Gerenciamento de usuários')
    .addTag('vehicles', 'Gerenciamento de veículos')
    .addTag('reservations', 'Gerenciamento de reservas')
    .addTag('auth', 'Autenticação')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger docs available at: http://localhost:${port}/api-docs`);
}
void bootstrap();
