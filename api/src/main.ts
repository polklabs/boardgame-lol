import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import 'reflect-metadata';
import { NestExpressApplication } from '@nestjs/platform-express';
// import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // app.use(helmet());

  // Enable CORS
  if (process.env.NODE_ENV === 'development') {
    // Allow any origin in development mode
    app.enableCors({
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    });
  } else {
    // Allow only 'https://wiki.polklabs.com' in production mode
    app.enableCors({
      origin: ['https://boardgame.lol', 'http://localhost:4200'],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    });
  }

  app.set('trust proxy', true);

  await app.listen(3000);
}
bootstrap();
