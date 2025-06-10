import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';
import {
  CategoriesBody,
  isPrivilegeError,
  PostsBody,
} from '../controllers.utils';
import { CategoryService } from '../../services/category/category.service';
import { PostService } from '../../services/post/post.service';

@Controller('categories')
export class CategoriesController {
  constructor(
    private categoryService: CategoryService,
    private postService: PostService,
  ) {}

  @Get()
  async getCategories() {
    return await this.categoryService.getCategories();
  }

  @Post()
  async createCategory(
    @Req() req: FastifyRequest,
    @Body() { title }: CategoriesBody,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    if (title == undefined)
      return res.badRequest('Névtelen járást nem lehet létrehozni!');

    return await this.categoryService.createCategory({
      title,
      creatorId: req.cookies.userId!,
    });
  }

  @Delete(':categoryId')
  @HttpCode(204)
  async deleteCategory(
    @Param('categoryId') categoryId: string,
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const response = await this.categoryService.deleteCategory(
      categoryId,
      req.cookies.userId!,
    );

    if (response == null) return res.badRequest('Ilyen járás nem létezik!');
    if (isPrivilegeError(response))
      return res.unauthorized(response.PrivilegeError);

    return response;
  }

  @Get(':categoryId/posts')
  async getPosts(
    @Param('categoryId') categoryId: string,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const category = await this.categoryService.getCategory(categoryId);
    if (category == null) return res.notFound();

    return await this.postService.getPostsByCategory(categoryId);
  }

  @Post(':categoryId/posts')
  async createPost(
    @Param('categoryId') categoryId: string,
    @Req() req: FastifyRequest,
    @Body() { title, body, images }: PostsBody,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    if (title === '' || title == undefined) {
      return res.badRequest('A poszt címe kötelező');
    }

    if (body === '' || body == undefined) {
      return res.badRequest('A poszt törzse kötelező');
    }

    return await this.postService.createPost({
      title,
      body,
      NoOfImages: images ?? 0,
      categoryId,
      uploaderId: req.cookies.userId!,
    });
  }
}
