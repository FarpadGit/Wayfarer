import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserService } from '../user/user.service';
import { User } from '../../db/entities/user.entity';
import { Post } from '../../db/entities/post.entity';
import { Comment } from '../../db/entities/comment.entity';
import { Like } from '../../db/entities/like.entity';
import { commentType } from '../../types';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Post) private readonly postRepo: Repository<Post>,
    @InjectRepository(Comment)
    private readonly commentRepo: Repository<Comment>,
    @InjectRepository(Like) private readonly likeRepo: Repository<Like>,
    private userService: UserService,
  ) {}

  async createComment(comment: Omit<commentType, 'id'>) {
    const newComment = new Comment();
    newComment.message = comment.message;
    newComment.user = await this.userRepo.findOneByOrFail({
      id: comment.userId,
    });
    if (comment.parentId != undefined)
      newComment.parent = await this.commentRepo.findOneByOrFail({
        id: comment.parentId,
      });
    newComment.post = await this.postRepo.findOneByOrFail({
      id: comment.postId,
    });

    await this.commentRepo.save(newComment);
    return newComment.id;
  }

  async getCommentAuthorId(commentId: string) {
    const comment = await this.commentRepo.findOne({
      where: { id: commentId },
      relations: ['user'],
      select: { user: { id: true } },
    });
    return comment?.user.id;
  }

  async updateComment(newComment: Omit<commentType, 'parentId' | 'postId'>) {
    const authorId = await this.getCommentAuthorId(newComment.id);
    if (authorId == undefined) return null;
    if (
      authorId !== newComment.userId &&
      newComment.userId !== this.userService.ADMIN_USER_ID
    ) {
      return {
        PrivilegeError: 'Nincs jogosultságod szerkeszteni ezt az üzenetet!',
      };
    }

    return await this.commentRepo.update(
      { id: newComment.id },
      { message: newComment.message },
    );
  }

  async deleteComment(id: string, userId: string) {
    const authorId = await this.getCommentAuthorId(id);
    if (authorId == undefined) return null;
    if (authorId !== userId && userId !== this.userService.ADMIN_USER_ID) {
      return { PrivilegeError: 'Nincs jogosultságod törölni ezt az üzenetet!' };
    }

    const comment = await this.commentRepo.findOneByOrFail({ id });
    await this.commentRepo.remove(comment);

    return id;
  }

  async toggleLike(commentId: string, userId: string) {
    const like = await this.likeRepo.findOne({
      where: {
        user: userId,
        comment: commentId,
      },
    });

    if (like == null) {
      const like = new Like();
      like.user = await this.userRepo.findOneByOrFail({ id: userId });
      like.comment = await this.commentRepo.findOneByOrFail({ id: commentId });
      await this.likeRepo.save(like);
      return { isLikeAdded: true };
    } else {
      await this.likeRepo.remove(like);
      return { isLikeAdded: false };
    }
  }
}
