import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { ResponseInterceptor } from './utils/response-interceptor';

async function bootstrap() {
  const port = process.env.port || 3005;
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.use(cookieParser());
  app.enableCors();
  await app.listen(port);
  console.log(`\nRunning at http://localhost:${port}`);
}

bootstrap();
