import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, Like as DBLike } from 'typeorm';
import { UserService } from '../user/user.service';
import { User } from '../../db/entities/user.entity';
import { Category } from '../../db/entities/category.entity';
import { Post } from '../../db/entities/post.entity';
import { Image } from '../../db/entities/image.entity';
import { Like } from '../../db/entities/like.entity';
import { imageType, postType } from '../../types';
import { randomUUID } from 'crypto';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    @InjectRepository(Post) private readonly postRepo: Repository<Post>,
    @InjectRepository(Image) private readonly imageRepo: Repository<Image>,
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

    const savedPost = await this.postRepo.save(newPost);

    if (post.noOfImages > 0) {
      for (let i = 0; i < post.noOfImages; i++) {
        const newImage = new Image();
        newImage.name = randomUUID() + 'WF_placeholder';
        newImage.url =
          'https://placehold.co/600x400?text=Kép%20Feltöltés%20Alatt%20%2F%0A%20Image%20Being%20Uploaded';
        newImage.thumbnail =
          'https://placehold.co/300x200?text=Kép%20Feltöltés%20Alatt%20%2F%0A%20Image%20Being%20Uploaded';
        newImage.post = savedPost;
        await this.imageRepo.save(newImage);
      }
    }

    return savedPost.id;
  }

  async updatePost(
    id: string,
    userId: string | undefined,
    postData: Partial<postType>,
    images: (Omit<imageType, 'url'> & {
      url: string | null;
      thumbnailUrl: string | null;
    })[],
  ) {
    const uploaderId = await this.getPostAuthorId(id);
    if (uploaderId == undefined) return null;
    if (uploaderId !== userId && userId !== this.userService.ADMIN_USER_ID) {
      return {
        PrivilegeError: 'Nincs jogosultságod szerkeszteni ezt a posztot!',
      };
    }

    // save post edits
    const post = await this.postRepo.findOneByOrFail({ id });
    const updatedPost = { ...post, ...postData };

    const savedPost = await this.postRepo.save(updatedPost);

    if (images.length === 0) return savedPost.id;

    // save image edits
    const placeholdersInDB = await this.imageRepo.find({
      where: {
        name: DBLike('%WF_placeholder'),
        post,
      },
    });
    console.log('placeholders:', placeholdersInDB);
    console.log('payload:', images);

    images.forEach(async (image, index) => {
      const imageInDB = await this.imageRepo.findOne({
        where: {
          name: image.name,
          post,
        },
      });
      console.log('imageInDB', imageInDB);

      // if image is newly added
      if (imageInDB == null) {
        const placeholderInDB = placeholdersInDB[index];
        console.log('placeholder' + index, placeholderInDB);

        if (image.url != null) {
          const newImage =
            placeholderInDB == null ? new Image() : placeholderInDB;

          newImage.name = image.name;
          newImage.url = image.url;
          newImage.thumbnail = image.thumbnailUrl ?? image.url;
          newImage.post = savedPost;
          await this.imageRepo.save(newImage);
          console.log('saving new image ', newImage);
        }
      } else {
        // else image is modified/deleted
        if (image.url == null) await this.imageRepo.remove(imageInDB);
        else {
          imageInDB.name = image.name;
          imageInDB.url = image.url;
          imageInDB.thumbnail = image.thumbnailUrl ?? image.url;
          await this.imageRepo.save(imageInDB);
          console.log('saving modified image ', imageInDB);
        }
      }
    });

    return savedPost.id;
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
        'images',
        'comments',
        'comments.parent',
        'comments.user',
        'comments.likes',
      ],
      select: {
        id: true,
        body: true,
        title: true,
        images: true,
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

  async getPostImages(id: string) {
    const post = await this.postRepo.findOne({
      where: { id },
      relations: ['images'],
      select: {
        id: true,
        images: true,
      },
    });

    if (post == null) return null;

    return post.images;
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
