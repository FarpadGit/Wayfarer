import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostService } from './post.service';
import { UserService } from '../user/user.service';
import { User } from '../../../src/entities/user.entity';
import { Category } from '../../../src/entities/category.entity';
import { Post } from '../../../src/entities/post.entity';
import { Image } from '../../../src/entities/image.entity';
import { Like } from '../../../src/entities/like.entity';
import { MockType } from '../../../test/types';
import {
  mockCategory,
  mockComment,
  mockLike,
  mockPost,
  mockImage,
  mockUser,
} from '../../../test/mocks';

describe('PostService', () => {
  let postService: PostService;
  let mockUserRepo: MockType<Repository<User>>;
  let mockCategoryRepo: MockType<Repository<Category>>;
  let mockPostRepo: MockType<Repository<Post>>;
  let mockImageRepo: MockType<Repository<Image>>;
  let mockLikeRepo: MockType<Repository<Like>>;

  const mockUserService = {
    ADMIN_USER_ID: 'fakeAdminUserID',
  };

  const mockPostWithComments = {
    ...mockPost,
    images: [mockImage],
    comments: [mockComment, mockComment],
  };

  const repositoryMockFactory: () => MockType<Repository<any>> = jest.fn(
    () => ({
      find: jest.fn((entity) => entity),
      findOne: jest.fn((entity) => entity),
      findOneByOrFail: jest.fn((entity) => entity),
      save: jest.fn((entity) => entity),
      remove: jest.fn((entity) => entity),
    }),
  );
  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
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
        {
          provide: getRepositoryToken(Post),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Image),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Like),
          useFactory: repositoryMockFactory,
        },
      ],
    })
      .overrideProvider(UserService)
      .useValue(mockUserService)
      .compile();

    postService = module.get<PostService>(PostService);
    mockUserRepo = module.get(getRepositoryToken(User));
    mockPostRepo = module.get(getRepositoryToken(Post));
    mockImageRepo = module.get(getRepositoryToken(Image));
    mockCategoryRepo = module.get(getRepositoryToken(Category));
    mockLikeRepo = module.get(getRepositoryToken(Like));

    mockPostRepo.find?.mockResolvedValue([mockPost, mockPost]);
    mockPostRepo.findOne?.mockResolvedValue(mockPostWithComments);
    mockPostRepo.findOneByOrFail?.mockResolvedValue(mockPost);
    mockImageRepo.findOne?.mockResolvedValue(null);
    mockUserRepo.findOneByOrFail?.mockResolvedValue(mockUser);
    mockCategoryRepo.findOneByOrFail?.mockResolvedValue(mockCategory);
    mockLikeRepo.find?.mockResolvedValue([mockLike]);

    mockPostRepo.save?.mockResolvedValue(mockPost);
  });

  it('should be defined', () => {
    expect(postService).toBeDefined();
  });

  it('should get all posts by category', async () => {
    const result = await postService.getPostsByCategory(mockCategory.id);

    expect(result).toEqual([mockPost, mockPost]);
  });

  it('should create a new post', async () => {
    const result = await postService.createPost({
      title: 'New Post Title',
      body: 'lorem ipsum',
      categoryId: mockCategory.id,
      uploaderId: mockUser.id,
    });

    expect(mockPostRepo.save).toHaveBeenCalledWith({
      title: 'New Post Title',
      body: 'lorem ipsum',
      category: mockCategory,
      uploader: mockUser,
    });
    expect(result).toBe(mockPost.id);
  });

  it('should get user who created a post', async () => {
    const result = await postService.getPostAuthorId(mockPost.id);

    expect(result).toBe(mockUser.id);
  });

  describe('update post', () => {
    const mockNewImages = [
      { name: mockImage.name, url: mockImage.url, postId: mockPost.id },
    ];

    it('should update a post with new images', async () => {
      const result = await postService.updatePost(
        mockPost.id,
        mockUser.id,
        {},
        mockNewImages,
      );

      expect(mockPostRepo.save).toHaveBeenCalledWith(mockPost);
      expect(mockImageRepo.save).toHaveBeenCalledTimes(mockNewImages.length);
      expect(mockImageRepo.save).toHaveBeenCalledWith({
        name: mockImage.name,
        url: mockImage.url,
        post: mockPost,
      });
      expect(result).toBe(mockPost.id);
    });

    it('should update a post by removing images', async () => {
      mockImageRepo.findOne?.mockResolvedValueOnce(mockImage);

      const result = await postService.updatePost(
        mockPost.id,
        mockUser.id,
        {},
        [{ ...mockNewImages[0], url: null }],
      );

      expect(mockPostRepo.save).toHaveBeenCalledWith(mockPost);
      expect(mockImageRepo.remove).toHaveBeenCalledWith(mockImage);
      expect(result).toBe(mockPost.id);
    });

    it('should update a post and its images', async () => {
      mockImageRepo.findOne?.mockResolvedValueOnce({ ...mockImage });

      const result = await postService.updatePost(
        mockPost.id,
        mockUser.id,
        {},
        [{ ...mockNewImages[0], url: 'fakenewurl.com' }],
      );

      expect(mockPostRepo.save).toHaveBeenCalledWith(mockPost);
      expect(mockImageRepo.save).toHaveBeenCalledWith({
        ...mockImage,
        url: 'fakenewurl.com',
      });
      expect(result).toBe(mockPost.id);
    });

    it("should return null if post doesn't exist", async () => {
      mockPostRepo.findOne?.mockResolvedValueOnce(null);

      const result = await postService.updatePost(
        mockPost.id,
        mockUser.id,
        {},
        mockNewImages,
      );

      expect(result).toBe(null);
      expect(mockPostRepo.save).not.toHaveBeenCalled();
      expect(mockImageRepo.save).not.toHaveBeenCalled();
    });

    it('should return PrivilegeError if user is not allowed to update post', async () => {
      const result = await postService.updatePost(
        mockPost.id,
        'bad User ID',
        {},
        mockNewImages,
      );

      expect(result).toHaveProperty('PrivilegeError');
      expect(mockPostRepo.save).not.toHaveBeenCalled();
      expect(mockImageRepo.save).not.toHaveBeenCalled();
    });

    it("should update someone else's post if user is admin", async () => {
      const result = await postService.updatePost(
        mockPost.id,
        mockUserService.ADMIN_USER_ID,
        {},
        mockNewImages,
      );

      expect(mockPostRepo.save).toHaveBeenCalledWith({ ...mockPost });
      expect(mockImageRepo.save).toHaveBeenCalledWith({
        name: mockImage.name,
        url: mockImage.url,
        post: mockPost,
      });
      expect(result).toBe(mockPost.id);
    });
  });

  describe('get post with comments', () => {
    it('should get a post and all of its comments and images', async () => {
      const result = await postService.getPostWithComments(
        mockPost.id,
        mockUser.id,
      );

      expect(result).toEqual({
        ...mockPost,
        images: [mockImage],
        comments: [
          expect.objectContaining({
            ...mockComment,
            isLikedByMe: expect.any(Boolean),
            likeCount: expect.any(Number),
          }),
          expect.objectContaining({
            ...mockComment,
            isLikedByMe: expect.any(Boolean),
            likeCount: expect.any(Number),
          }),
        ],
      });
    });

    it("should return null if post doesn't exist", async () => {
      mockPostRepo.findOne?.mockResolvedValueOnce(null);

      const result = await postService.getPostWithComments(
        mockPost.id,
        mockUser.id,
      );

      expect(result).toBe(null);
    });
  });

  describe('get post images', () => {
    it('should get every image belonging to post', async () => {
      mockPostRepo.findOne?.mockResolvedValueOnce({
        ...mockPost,
        images: [mockImage, mockImage],
      });

      const result = await postService.getPostImages(mockPost.id);

      expect(result).toEqual([mockImage, mockImage]);
    });

    it("should return null if post doesn't exist", async () => {
      mockPostRepo.findOne?.mockResolvedValueOnce(null);

      const result = await postService.getPostImages(mockPost.id);

      expect(result).toBe(null);
    });
  });

  describe('delete post', () => {
    it('should delete an existing post', async () => {
      const result = await postService.deletePost(mockPost.id, mockUser.id);

      expect(result).toBe(mockPost.id);
      expect(mockPostRepo.remove).toHaveBeenCalledWith(mockPost);
    });

    it("should return null if post doesn't exist", async () => {
      mockPostRepo.findOne?.mockResolvedValueOnce(null);

      const result = await postService.deletePost(mockPost.id, mockUser.id);

      expect(result).toBe(null);
      expect(mockPostRepo.remove).not.toHaveBeenCalled();
    });

    it('should return PrivilegeError if user is not allowed to delete post', async () => {
      const result = await postService.deletePost(mockPost.id, 'bad User ID');

      expect(result).toHaveProperty('PrivilegeError');
      expect(mockPostRepo.remove).not.toHaveBeenCalled();
    });

    it("should delete someone else's post if user is admin", async () => {
      const result = await postService.deletePost(
        mockPost.id,
        mockUserService.ADMIN_USER_ID,
      );

      expect(result).toBe(mockPost.id);
      expect(mockPostRepo.remove).toHaveBeenCalledWith(mockPost);
    });
  });
});
