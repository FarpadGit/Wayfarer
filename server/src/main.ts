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
    origin: [process.env.CLIENT_URL || ''],
    credentials: true,
    exposedHeaders: 'userId',
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
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
