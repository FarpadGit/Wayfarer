import { Test, TestingModule } from '@nestjs/testing';
import { FastifyRequest, FastifyReply } from 'fastify';
import { CategoriesController } from './categories.controller';
import { CategoryService } from '../../../src/services/category/category.service';
import { PostService } from '../../../src/services/post/post.service';
import { mockCategory, mockPost } from '../../../test/mocks';

describe('CategoriesController', () => {
  let categoriesController: CategoriesController;

  const mockCategoryService = {
    getCategories: jest.fn().mockResolvedValue([mockCategory, mockCategory]),
    getCategory: jest.fn().mockResolvedValue(mockCategory),
    createCategory: jest.fn().mockResolvedValue(null),
    deleteCategory: jest.fn().mockResolvedValue(mockCategory.id),
  };

  const mockPostService = {
    getPostsByCategory: jest.fn().mockResolvedValue([mockPost, mockPost]),
    createPost: jest.fn().mockResolvedValue(null),
  };

  const mockRequest = {
    cookies: { userId: 'fakeUserID' },
  } as unknown as FastifyRequest;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [CategoryService, PostService],
    })
      .overrideProvider(CategoryService)
      .useValue(mockCategoryService)
      .overrideProvider(PostService)
      .useValue(mockPostService)
      .compile();

    categoriesController =
      module.get<CategoriesController>(CategoriesController);
  });

  it('should be defined', () => {
    expect(categoriesController).toBeDefined();
  });

  it('should return all categories', async () => {
    const categories = await categoriesController.getCategories();

    expect(categories).toEqual([mockCategory, mockCategory]);
  });

  describe('create new category', () => {
    const mockResponse = {
      badRequest: jest.fn().mockReturnValue('badRequest called'),
    } as unknown as FastifyReply;

    it('should create a new category', async () => {
      const newCategoryTitle = 'new category title';

      const result = await categoriesController.createCategory(
        mockRequest,
        { title: newCategoryTitle },
        mockResponse,
      );

      expect(result).toBe(null);
      expect(mockCategoryService.createCategory).toHaveBeenCalledWith({
        title: newCategoryTitle,
        creatorId: mockRequest.cookies.userId,
      });
      expect(mockResponse.badRequest).not.toHaveBeenCalled();
    });

    it('should return error if title is missing', async () => {
      const result = await categoriesController.createCategory(
        mockRequest,
        {},
        mockResponse,
      );

      expect(result).toBe('badRequest called');
      expect(mockCategoryService.createCategory).not.toHaveBeenCalled();
      expect(mockResponse.badRequest).toHaveBeenCalledTimes(1);
    });
  });

  describe('delete category', () => {
    const mockResponse = {
      badRequest: jest.fn().mockReturnValue('badRequest called'),
      unauthorized: jest.fn().mockReturnValue('unauthorized called'),
    } as unknown as FastifyReply;

    it('should delete an existing category', async () => {
      const result = await categoriesController.deleteCategory(
        mockCategory.id,
        mockRequest,
        mockResponse,
      );

      expect(result).toBe(mockCategory.id);
      expect(mockCategoryService.deleteCategory).toHaveBeenCalledWith(
        mockCategory.id,
        mockRequest.cookies.userId,
      );
      expect(mockResponse.badRequest).not.toHaveBeenCalled();
      expect(mockResponse.unauthorized).not.toHaveBeenCalled();
    });

    it("should return error if category didn't exist", async () => {
      mockCategoryService.deleteCategory.mockResolvedValueOnce(null);

      const result = await categoriesController.deleteCategory(
        mockCategory.id,
        mockRequest,
        mockResponse,
      );

      expect(result).toBe('badRequest called');
      expect(mockCategoryService.deleteCategory).toHaveBeenCalledWith(
        mockCategory.id,
        mockRequest.cookies.userId,
      );
      expect(mockResponse.badRequest).toHaveBeenCalled();
      expect(mockResponse.unauthorized).not.toHaveBeenCalled();
    });

    it('should return error if user is not allowed to delete category', async () => {
      mockCategoryService.deleteCategory.mockResolvedValueOnce({
        PrivilegeError: true,
      });

      const result = await categoriesController.deleteCategory(
        mockCategory.id,
        mockRequest,
        mockResponse,
      );

      expect(result).toBe('unauthorized called');
      expect(mockCategoryService.deleteCategory).toHaveBeenCalledWith(
        mockCategory.id,
        mockRequest.cookies.userId,
      );
      expect(mockResponse.badRequest).not.toHaveBeenCalled();
      expect(mockResponse.unauthorized).toHaveBeenCalled();
    });
  });

  describe('get posts by category', () => {
    const mockResponse = {
      notFound: jest.fn().mockReturnValue('notFound called'),
    } as unknown as FastifyReply;

    it('should get all posts under a category', async () => {
      const result = await categoriesController.getPosts(
        mockCategory.id,
        mockResponse,
      );

      expect(result).toEqual([mockPost, mockPost]);
      expect(mockCategoryService.getCategory).toHaveBeenCalledWith(
        mockCategory.id,
      );
      expect(mockPostService.getPostsByCategory).toHaveBeenCalledWith(
        mockCategory.id,
      );
      expect(mockResponse.notFound).not.toHaveBeenCalled();
    });

    it("should return error if category doesn't exist", async () => {
      mockCategoryService.getCategory?.mockResolvedValueOnce(null);

      const result = await categoriesController.getPosts(
        mockCategory.id,
        mockResponse,
      );

      expect(result).toBe('notFound called');
      expect(mockCategoryService.getCategory).toHaveBeenCalledWith(
        mockCategory.id,
      );
      expect(mockPostService.getPostsByCategory).not.toHaveBeenCalled();
      expect(mockResponse.notFound).toHaveBeenCalled();
    });
  });

  describe('create new post', () => {
    const mockResponse = {
      badRequest: jest.fn().mockReturnValue('badRequest called'),
    } as unknown as FastifyReply;
    const newPostTitle = 'New Post Title';
    const newPostBody = 'lorem ipsum';

    it('should create a new post', async () => {
      const result = await categoriesController.createPost(
        mockCategory.id,
        mockRequest,
        { title: newPostTitle, body: newPostBody },
        mockResponse,
      );

      expect(mockPostService.createPost).toHaveBeenCalledWith({
        title: newPostTitle,
        body: newPostBody,
        noOfImages: 0,
        categoryId: mockCategory.id,
        uploaderId: mockRequest.cookies.userId,
      });
      expect(mockResponse.badRequest).not.toHaveBeenCalled();
    });

    it('should return error if title is missing', async () => {
      const result = await categoriesController.createPost(
        mockCategory.id,
        mockRequest,
        { body: newPostBody },
        mockResponse,
      );

      expect(result).toBe('badRequest called');
      expect(mockPostService.createPost).not.toHaveBeenCalled();
      expect(mockResponse.badRequest).toHaveBeenCalled();
    });
    it('should return error if body is missing', async () => {
      const result = await categoriesController.createPost(
        mockCategory.id,
        mockRequest,
        { title: newPostTitle },
        mockResponse,
      );

      expect(result).toBe('badRequest called');
      expect(mockPostService.createPost).not.toHaveBeenCalled();
      expect(mockResponse.badRequest).toHaveBeenCalled();
    });
  });
});
