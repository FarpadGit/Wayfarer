import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, Like as DBLike } from 'typeorm';
import { UserService } from '../user/user.service';
import { User } from '../../db/entities/user.entity';
import { Category } from '../../db/entities/category.entity';
import { Post } from '../../db/entities/post.entity';
import { Image } from '../../db/entities/image.entity';
import { Like } from '../../db/entities/like.entity';
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
        slug: true,
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
    newPost.slug = await this.generateSlug(post.title);
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

  private async generateSlug(text: string) {
    const maxLength = 50;
    // replace whitespaces, comma+spaces and simple commas with dashes
    let slug = text.toLowerCase().replace(/,*\s+/g, '-').replace(',', '-');
    // replace multiple dashes with a single one
    while (slug.includes('--')) slug = slug.replace('--', '-');
    // remove accents and other diacritical marks from text
    slug = slug.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    // remove every other character that isn't lowercase alphabet, numbers or dash
    slug = slug.replace(/[^a-z0-9\-]*/g, '');
    // truncate text to maxLength
    if (slug.length > maxLength) slug = slug.slice(0, maxLength);

    let conflictingPost = await this.postRepo.findOne({ where: { slug } });
    let i = 1;
    while (conflictingPost !== null) {
      const originalSlug = slug;
      i++;
      const suffix = '-vol-' + i;
      // try adding an ever increasing suffix to slug if one already exists,
      // while keeping the text not longer then maxLength
      if (slug.length + suffix.length > maxLength)
        slug = originalSlug.slice(0, maxLength - suffix.length);
      slug = slug + suffix;
      conflictingPost = await this.postRepo.findOne({ where: { slug } });
    }
    return slug;
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
    for (let key in postData) {
      if (postData[key] === undefined) delete postData[key];
    }
    const post = await this.postRepo.findOneByOrFail({ id });
    const updatedPost = { ...post, ...postData };
    if (postData['title'] && postData.title !== post.title)
      updatedPost.slug = await this.generateSlug(updatedPost.title);

    const savedPost = await this.postRepo.save(updatedPost);

    if (images.length === 0) return savedPost.slug;

    // save image edits
    const placeholdersInDB = await this.imageRepo.find({
      where: {
        name: DBLike('%WF_placeholder'),
        post,
      },
    });

    let index = -1;
    for (const image of images) {
      index++;
      const imageInDB = await this.imageRepo.findOne({
        where: {
          name: image.name,
          post,
        },
      });

      // if image is newly added
      if (imageInDB == null) {
        const placeholderInDB = placeholdersInDB[index];

        if (image.url != null) {
          const newImage =
            placeholderInDB == null ? new Image() : placeholderInDB;

          newImage.name = image.name;
          newImage.url = image.url;
          newImage.thumbnail = image.thumbnailUrl ?? image.url;
          newImage.post = savedPost;
          await this.imageRepo.save(newImage);
        }
      } else {
        // else image is modified/deleted
        if (image.url == null) await this.imageRepo.remove(imageInDB);
        else {
          imageInDB.name = image.name;
          imageInDB.url = image.url;
          imageInDB.thumbnail = image.thumbnailUrl ?? image.url;
          await this.imageRepo.save(imageInDB);
        }
      }
    }

    return savedPost.slug;
  }

  async getPostAuthorId(postId: string) {
    const post = await this.postRepo.findOne({
      where: { id: postId },
      relations: ['uploader'],
      select: { uploader: { id: true } },
    });
    return post?.uploader.id;
  }

  async getPostWithComments(slug: string, userId: string) {
    const post = await this.postRepo.findOne({
      where: { slug },
      order: { comments: { createdAt: 'DESC' } },
      relations: [
        'uploader',
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
        uploader: {
          email: true,
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
      uploaderEmail: post.uploader.email,
      uploader: undefined,
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
