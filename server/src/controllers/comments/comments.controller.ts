import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Param,
  Post,
  Put,
  Req,
  Res,
} from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';
import { CommentsBody, isPrivilegeError } from '../controllers.utils';
import { CommentService } from '../../services/comment/comment.service';

@Controller('comments')
export class CommentsController {
  constructor(private commentService: CommentService) {}

  @Put(':commentId')
  async updateComment(
    @Param('commentId') commentId: string,
    @Req() req: FastifyRequest,
    @Body() { message }: CommentsBody,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    if (message === '' || message == null) {
      return res.badRequest('Az üzenet szövege kötelező');
    }

    const response = await this.commentService.updateComment({
      id: commentId,
      message,
      userId: req.cookies.userId!,
    });

    if (response == null) return res.badRequest('Ilyen üzenet nem létezik!');
    if (isPrivilegeError(response))
      return res.unauthorized(response.PrivilegeError);

    return response;
  }

  @Delete(':commentId')
  @HttpCode(204)
  async deleteComment(
    @Param('commentId') commentId: string,
    @Req() req: FastifyRequest,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const response = await this.commentService.deleteComment(
      commentId,
      req.cookies.userId!,
    );

    if (response == null) return res.badRequest('Ilyen üzenet nem létezik!');
    if (isPrivilegeError(response))
      return res.unauthorized(response.PrivilegeError);

    return response;
  }

  @Post(':commentId/toggleLike')
  async toggleLike(
    @Param('commentId') commentId: string,
    @Req() req: FastifyRequest,
  ) {
    return await this.commentService.toggleLike(commentId, req.cookies.userId!);
  }
}
