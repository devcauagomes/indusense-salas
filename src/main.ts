import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Habilita validação global via DTOs
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  
  // Permite requisições do Flutter/Web
  app.enableCors();

  await app.listen(3000);
  console.log(`🚀 Aplicação rodando na porta: http://localhost:3000`);
}
bootstrap();
