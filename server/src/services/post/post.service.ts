import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { UserService } from '../user/user.service';
import { User } from '../../entities/user.entity';
import { Category } from '../../entities/category.entity';
import { Post } from '../../entities/post.entity';
import { Like } from '../../entities/like.entity';
import { postType } from '../../types';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    @InjectRepository(Post) private readonly postRepo: Repository<Post>,
    @InjectRepository(Like) private readonly likeRepo: Repository<Like>,
    private userService: UserService,
  ) {}

  async getPostsByCategory(categoryId: string) {
    return await this.postRepo.find({
      where: { category: { id: categoryId } },
      relations: ['category', 'uploader'],
      select: {
        id: true,
        title: true,
        createdAt: true,
        category: { id: true },
        uploader: {
          email: true,
          name: true,
        },
      },
    });
  }

  async createPost(post: postType) {
    const newPost = new Post();
    newPost.title = post.title;
    newPost.body = post.body;
    newPost.uploader = await this.userRepo.findOneByOrFail({
      id: post.uploaderId,
    });
    newPost.category = await this.categoryRepo.findOneByOrFail({
      id: post.categoryId,
    });
    await this.postRepo.save(newPost);
  }

  async getPostAuthorId(postId: string) {
    const post = await this.postRepo.findOne({
      where: { id: postId },
      relations: ['uploader'],
      select: { uploader: { id: true } },
    });
    return post?.uploader.id;
  }

  async getPostWithComments(id: string, userId: string) {
    const post = await this.postRepo.findOne({
      where: { id },
      order: { comments: { createdAt: 'DESC' } },
      relations: [
        'comments',
        'comments.parent',
        'comments.user',
        'comments.likes',
      ],
      select: {
        id: true,
        body: true,
        title: true,
        comments: {
          id: true,
          message: true,
          parent: { id: true },
          createdAt: true,
          user: {
            id: true,
            email: true,
            name: true,
          },
          likes: true,
        },
      },
    });

    if (post == null) return null;

    const commentlikeCount = post.comments.map((comment) => ({
      id: comment.id,
      _count: comment.likes.length,
    }));

    const likes = await this.likeRepo.find({
      where: {
        user: userId,
        comment: In(post.comments.map((comment) => comment.id)),
      },
    });

    return {
      ...post,
      comments: post.comments.map((comment) => {
        return {
          ...comment,
          parentId: comment.parent?.id || null,
          isLikedByMe: Boolean(
            likes.find((like) => like.comment === comment.id),
          ),
          likeCount:
            commentlikeCount.find((i) => i.id === comment.id)?._count || 0,
        };
      }),
    };
  }

  async deletePost(id: string, userId: string) {
    const uploaderId = await this.getPostAuthorId(id);
    if (uploaderId == undefined) return null;
    if (uploaderId !== userId && userId !== this.userService.ADMIN_USER_ID) {
      return { PrivilegeError: 'Nincs jogosultságod törölni ezt a posztot!' };
    }

    const post = await this.postRepo.findOneByOrFail({ id });

    await this.postRepo.remove(post);
    return id;
  }
}
