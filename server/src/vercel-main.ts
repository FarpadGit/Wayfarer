// /vercel-func.js
import { NestFactory, HttpAdapterHost } from '@nestjs/core';

import { AppModule } from '../dist/app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import fastifyCookie from '@fastify/cookie';
import sensible from '@fastify/sensible';

// Keep the app instance in memory for subsequent requests
let app: NestFastifyApplication | undefined;
export default async function handler(req, res) {
  // Bootstrap our NestJS app on cold start
  if (!app) {
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

    // This is important
    await app.init();
  }
  const adapterHost = app!.get(HttpAdapterHost);
  const httpAdapter = adapterHost.httpAdapter;
  const instance = httpAdapter.getInstance();

  instance(req, res);
}
