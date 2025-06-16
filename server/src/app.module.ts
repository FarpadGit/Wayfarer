import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Category } from './db/entities/category.entity';
import { Post } from './db/entities/post.entity';
import { Image } from './db/entities/image.entity';
import { Comment } from './db/entities/comment.entity';
import { Like } from './db/entities/like.entity';
import { User } from './db/entities/user.entity';
import { cookiesInterceptor } from './interceptors/cookies.interceptor';
import { AuthController } from './controllers/auth/auth.controller';
import { CategoriesController } from './controllers/categories/categories.controller';
import { PostsController } from './controllers/posts/posts.controller';
import { ImagesController } from './controllers/images/images.controller';
import { CommentsController } from './controllers/comments/comments.controller';
import { SeedService } from './db/seed-service/seed.service';
import { UserService } from './services/user/user.service';
import { PostService } from './services/post/post.service';
import { ImageService } from './services/image/image.service';
import { CategoryService } from './services/category/category.service';
import { CommentService } from './services/comment/comment.service';
import { PostSubscriber } from './db/subscribers/post.subscriber';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: 5432,
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      entities: [Category, Post, Image, Comment, Like, User],
      subscribers: [PostSubscriber],
      database: process.env.POSTGRES_DATABASE,
      ssl: process.env.POSTGRES_SSL?.toLowerCase() === 'true',
      // synchronize: true,
      // logging: true,
    }),
    TypeOrmModule.forFeature([Category, Post, Image, Comment, Like, User]),
  ],
  controllers: [
    AuthController,
    CategoriesController,
    PostsController,
    CommentsController,
    ImagesController,
  ],
  providers: [
    UserService,
    CategoryService,
    PostService,
    CommentService,
    ImageService,
    SeedService,
    {
      provide: APP_INTERCEPTOR,
      useExisting: cookiesInterceptor,
    },
    cookiesInterceptor,
  ],
})
export class AppModule {}
