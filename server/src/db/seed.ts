import { NestFactory } from '@nestjs/core';
import { SeedService } from './seed-service/seed.service';
import { AppModule } from '../app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const seedService = app.get(SeedService);
  await seedService.seed();
  await app.close();
}

bootstrap();
