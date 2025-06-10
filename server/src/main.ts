import { NestFactory } from '@nestjs/core';
import {
  NestFastifyApplication,
  FastifyAdapter,
} from '@nestjs/platform-fastify';
import fastifyCookie from '@fastify/cookie';
import sensible from '@fastify/sensible';
import { AppModule } from './app.module';

async function bootstrap() {
  const adapter = new FastifyAdapter();
  adapter.enableCors({
    origin: [process.env.CLIENT_URL || '', process.env.IMAGE_CLIENT_URL || ''],
    credentials: true,
    exposedHeaders: 'userId',
    methods: 'GET,HEAD,PUT,POST,DELETE,OPTIONS',
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
    ],
  });
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    adapter,
  );
  await app.register(sensible);
  await app.register(fastifyCookie, {
    secret: process.env.COOKIE_SECRET,
    parseOptions: { sameSite: 'none', secure: true },
  });
  // for Docker:
  // await app.listen(process.env.PORT ?? 3001, '0.0.0.0');
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
