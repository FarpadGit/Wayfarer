import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserService } from '../user/user.service';
import { PostService } from '../post/post.service';
import { User } from '../../db/entities/user.entity';
import { Category } from '../../db/entities/category.entity';
import { categoryType } from '../../types';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    private postService: PostService,
    private userService: UserService,
  ) {}

  async getCategories() {
    return await this.categoryRepo.find({
      relations: ['creator'],
      select: {
        id: true,
        title: true,
        createdAt: true,
        creator: {
          email: true,
          name: true,
        },
      },
    });
  }

  async getCategory(id: string) {
    return await this.categoryRepo.findOne({
      where: { id },
    });
  }

  async createCategory(category: categoryType) {
    const creator = await this.userRepo.findOneByOrFail({
      id: category.creatorId,
    });

    const newCategory = new Category();
    newCategory.title = category.title;
    newCategory.creator = creator;
    await this.categoryRepo.save(newCategory);
  }

  async deleteCategory(id: string, userId: string) {
    const creatorId = await this.getCategoryOwnerId(id);
    if (creatorId == undefined) return null;
    if (creatorId !== userId && userId !== this.userService.ADMIN_USER_ID) {
      return { PrivilegeError: 'Nincs jogosultságod törölni ezt a járást!' };
    }

    const category = await this.categoryRepo.findOneOrFail({
      where: { id },
      relations: ['posts'],
    });

    // deleting posts manually will trigger their attachment image deletion workflow as well
    // deleting just the category will also delete everything inside it but will not send a request to the image server to remove their records as well
    category.posts.forEach(
      async (post) =>
        await this.postService.deletePost(
          post.id,
          this.userService.ADMIN_USER_ID,
        ),
    );
    await this.categoryRepo.remove(category);

    return id;
  }

  async getCategoryOwnerId(categoryId: string) {
    const category = await this.categoryRepo.findOne({
      where: { id: categoryId },
      relations: ['creator'],
      select: { creator: { id: true } },
    });

    return category?.creator.id;
  }
}
