import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';
import {
  CommentsBody,
  ImageServerBody,
  isPrivilegeError,
} from '../controllers.utils';
import { PostService } from '../../services/post/post.service';
import { CommentService } from '../../services/comment/comment.service';

@Controller('posts')
export class PostsController {
  constructor(
    private postService: PostService,
    private commentService: CommentService,
  ) {}

  @Get(':postId')
  async getPost(
    @Param('postId') postId: string,
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const response = await this.postService.getPostWithComments(
      postId,
      req.cookies.userId!,
    );

    if (response == null) return res.notFound('Ilyen poszt nem létezik!');
    return response;
  }

  @Patch(':postId')
  async patchPost(
    @Param('postId') postId: string,
    @Req() req: FastifyRequest,
    @Body() { images }: ImageServerBody,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    console.log('recieved images: ', images);

    const response = await this.postService.updatePost(
      postId,
      req.cookies.userId,
      {},
      images,
    );

    if (response == null) return res.badRequest('Ilyen poszt nem létezik!');
    if (isPrivilegeError(response))
      return res.unauthorized(response.PrivilegeError);

    return response;
  }

  @Delete(':postId')
  @HttpCode(204)
  async deletePost(
    @Param('postId') postId: string,
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const response = await this.postService.deletePost(
      postId,
      req.cookies.userId!,
    );

    if (response == null) return res.badRequest('Ilyen poszt nem létezik!');
    if (isPrivilegeError(response))
      return res.unauthorized(response.PrivilegeError);

    return { id: response };
  }

  @Post(':postId/comments')
  async createComment(
    @Param('postId') postId: string,
    @Req() req: FastifyRequest,
    @Body() { message, parentId = null }: CommentsBody,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    if (message === '' || message == null) {
      return res.badRequest('Az üzenet szövege kötelező');
    }

    return await this.commentService.createComment({
      message,
      postId,
      parentId,
      userId: req.cookies.userId!,
    });
  }
}
