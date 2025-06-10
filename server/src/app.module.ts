import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Category } from './entities/category.entity';
import { Post } from './entities/post.entity';
import { Image } from './entities/image.entity';
import { Comment } from './entities/comment.entity';
import { Like } from './entities/like.entity';
import { User } from './entities/user.entity';
import { cookiesInterceptor } from './interceptors/cookies.interceptor';
import { AuthController } from './controllers/auth/auth.controller';
import { CategoriesController } from './controllers/categories/categories.controller';
import { PostsController } from './controllers/posts/posts.controller';
import { CommentsController } from './controllers/comments/comments.controller';
import { SeedService } from './db/seed-service/seed.service';
import { UserService } from './services/user/user.service';
import { PostService } from './services/post/post.service';
import { CategoryService } from './services/category/category.service';
import { CommentService } from './services/comment/comment.service';

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
  ],
  providers: [
    UserService,
    CategoryService,
    PostService,
    CommentService,
    SeedService,
    {
      provide: APP_INTERCEPTOR,
      useExisting: cookiesInterceptor,
    },
    cookiesInterceptor,
  ],
})
export class AppModule {}
