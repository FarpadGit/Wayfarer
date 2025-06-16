import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoryService } from './category.service';
import { UserService } from '../user/user.service';
import { User } from '../../db/entities/user.entity';
import { Category } from '../../db/entities/category.entity';
import { categoryType } from '../../types';
import { mockCategory, mockUser } from '../../../test/mocks';
import { MockType } from '../../../test/types';
import { PostService } from '../post/post.service';

describe('CategoryService', () => {
  let categoryService: CategoryService;
  let mockUserRepo: MockType<Repository<User>>;
  let mockCategoryRepo: MockType<Repository<Category>>;

  const mockUserService = {
    ADMIN_USER_ID: 'fakeAdminUserID',
  };

  const mockPostService = {
    deletePost: jest.fn(),
  };

  const repositoryMockFactory: () => MockType<Repository<any>> = jest.fn(
    () => ({
      find: jest.fn((entity) => entity),
      findOne: jest.fn((entity) => entity),
      findOneOrFail: jest.fn((entity) => entity),
      findOneByOrFail: jest.fn((entity) => entity),
      save: jest.fn((entity) => entity),
      remove: jest.fn((entity) => entity),
    }),
  );

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        PostService,
        UserService,
        {
          provide: getRepositoryToken(User),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Category),
          useFactory: repositoryMockFactory,
        },
      ],
    })
      .overrideProvider(UserService)
      .useValue(mockUserService)
      .overrideProvider(PostService)
      .useValue(mockPostService)
      .compile();

    categoryService = module.get<CategoryService>(CategoryService);
    mockUserRepo = module.get(getRepositoryToken(User));
    mockCategoryRepo = module.get(getRepositoryToken(Category));

    mockUserRepo.findOneByOrFail?.mockResolvedValue(mockUser);
    mockCategoryRepo.find?.mockResolvedValue([mockCategory, mockCategory]);
    mockCategoryRepo.findOne?.mockResolvedValue(mockCategory);
    mockCategoryRepo.findOneOrFail?.mockResolvedValue(mockCategory);
  });

  it('should be defined', () => {
    expect(categoryService).toBeDefined();
  });

  it('should get all categories', async () => {
    const result = await categoryService.getCategories();

    expect(result).toEqual([mockCategory, mockCategory]);
  });

  it('should create a new category', async () => {
    const newCategory: categoryType = {
      title: 'New Category',
      creatorId: mockUser.id,
    };

    await categoryService.createCategory(newCategory);

    expect(mockCategoryRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        title: newCategory.title,
        creator: mockUser,
      }),
    );
  });

  describe('delete category', () => {
    it('should delete an existing category', async () => {
      const result = await categoryService.deleteCategory(
        mockCategory.id,
        mockUser.id,
      );

      expect(result).toBe(mockCategory.id);
      expect(mockCategoryRepo.remove).toHaveBeenCalledWith(mockCategory);
    });

    it("should return null if category doesn't exist", async () => {
      mockCategoryRepo.findOne?.mockResolvedValueOnce(null);

      const result = await categoryService.deleteCategory(
        mockCategory.id,
        mockUser.id,
      );

      expect(result).toBe(null);
      expect(mockCategoryRepo.remove).not.toHaveBeenCalled();
    });

    it('should return PrivilegeError if user is not allowed to delete category', async () => {
      const result = await categoryService.deleteCategory(
        mockCategory.id,
        'bad User ID',
      );

      expect(result).toHaveProperty('PrivilegeError');
      expect(mockCategoryRepo.remove).not.toHaveBeenCalled();
    });

    it("should delete someone else's category if user is admin", async () => {
      const result = await categoryService.deleteCategory(
        mockCategory.id,
        mockUserService.ADMIN_USER_ID,
      );

      expect(result).toBe(mockCategory.id);
      expect(mockCategoryRepo.remove).toHaveBeenCalledWith(mockCategory);
    });
  });

  it('should get the user who created a category', async () => {
    const result = await categoryService.getCategoryOwnerId(mockCategory.id);

    expect(result).toBe(mockUser.id);
  });
});
