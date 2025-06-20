import { Test, TestingModule } from '@nestjs/testing';
import { FastifyRequest, FastifyReply } from 'fastify';
import { PostsController } from './posts.controller';
import { PostService } from '../../services/post/post.service';
import { CommentService } from '../../services/comment/comment.service';
import { mockComment, mockPost } from '../../../test/mocks';

describe('PostsController', () => {
  let postsController: PostsController;

  const mockPostService = {
    getPostWithComments: jest.fn().mockResolvedValue('mock post return value'),
    getPostImages: jest.fn().mockResolvedValue([{ name: 'fakeImage.jpg' }]),
    updatePost: jest.fn().mockResolvedValue(mockPost.id),
    deletePost: jest.fn().mockResolvedValue(mockPost.id),
  };

  const mockCommentService = {
    createComment: jest.fn().mockResolvedValue(mockComment.id),
  };

  const mockRequest = {
    cookies: { userId: 'fakeUserID' },
  } as unknown as FastifyRequest;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [PostService, CommentService],
    })
      .overrideProvider(PostService)
      .useValue(mockPostService)
      .overrideProvider(CommentService)
      .useValue(mockCommentService)
      .compile();

    postsController = module.get<PostsController>(PostsController);
  });

  it('should be defined', () => {
    expect(postsController).toBeDefined();
  });

  describe('get post', () => {
    const mockResponse = {
      badRequest: jest.fn().mockReturnValue('badRequest called'),
      notFound: jest.fn().mockReturnValue('notFound called'),
    } as unknown as FastifyReply;

    it('should get an existing post', async () => {
      const result = await postsController.getPost(
        mockPost.id,
        mockRequest,
        mockResponse,
      );

      expect(result).toBe('mock post return value');
      expect(mockPostService.getPostWithComments).toHaveBeenCalledWith(
        mockPost.id,
        mockRequest.cookies.userId,
      );
      expect(mockResponse.badRequest).not.toHaveBeenCalled();
    });

    it("should return error if post didn't exist", async () => {
      mockPostService.getPostWithComments.mockResolvedValueOnce(null);

      const result = await postsController.getPost(
        mockPost.id,
        mockRequest,
        mockResponse,
      );

      expect(result).toBe('notFound called');
      expect(mockPostService.getPostWithComments).toHaveBeenCalledWith(
        mockPost.id,
        mockRequest.cookies.userId,
      );
      expect(mockResponse.notFound).toHaveBeenCalled();
    });
  });

  describe('update post', () => {
    const mockResponse = {
      badRequest: jest.fn().mockReturnValue('badRequest called'),
      unauthorized: jest.fn().mockReturnValue('unauthorized called'),
    } as unknown as FastifyReply;
    const mockImages = [
      {
        name: 'fakeImage1.jpg',
        url: 'fakeurl1.com',
        thumbnailUrl: 'fakeurl1.com',
        postId: 'fakePostID',
      },
      {
        name: 'fakeImage2.jpg',
        url: 'fakeurl2.com',
        thumbnailUrl: 'fakeurl1.com',
        postId: 'fakePostID',
      },
    ];

    it('should update an existing post', async () => {
      const result = await postsController.patchPost(
        mockPost.id,
        mockRequest,
        { images: mockImages },
        mockResponse,
      );

      expect(result).toBe(mockPost.id);
      expect(mockPostService.updatePost).toHaveBeenCalledWith(
        mockPost.id,
        mockRequest.cookies.userId,
        expect.objectContaining({}),
        mockImages,
      );
      expect(mockResponse.badRequest).not.toHaveBeenCalled();
      expect(mockResponse.unauthorized).not.toHaveBeenCalled();
    });

    it("should return error if post didn't exist", async () => {
      mockPostService.updatePost.mockResolvedValueOnce(null);

      const result = await postsController.patchPost(
        mockPost.id,
        mockRequest,
        { images: mockImages },
        mockResponse,
      );

      expect(result).toBe('badRequest called');
      expect(mockPostService.updatePost).toHaveBeenCalledWith(
        mockPost.id,
        mockRequest.cookies.userId,
        expect.objectContaining({}),
        mockImages,
      );
      expect(mockResponse.badRequest).toHaveBeenCalled();
      expect(mockResponse.unauthorized).not.toHaveBeenCalled();
    });

    it('should return error if user is not allowed to update post', async () => {
      mockPostService.updatePost.mockResolvedValueOnce({
        PrivilegeError: true,
      });

      const result = await postsController.patchPost(
        mockPost.id,
        mockRequest,
        { images: mockImages },
        mockResponse,
      );

      expect(result).toBe('unauthorized called');
      expect(mockPostService.updatePost).toHaveBeenCalledWith(
        mockPost.id,
        mockRequest.cookies.userId,
        expect.objectContaining({}),
        mockImages,
      );
      expect(mockResponse.badRequest).not.toHaveBeenCalled();
      expect(mockResponse.unauthorized).toHaveBeenCalled();
    });
  });

  describe('delete post', () => {
    const mockResponse = {
      badRequest: jest.fn().mockReturnValue('badRequest called'),
      unauthorized: jest.fn().mockReturnValue('unauthorized called'),
    } as unknown as FastifyReply;

    it('should delete an existing post', async () => {
      const result = await postsController.deletePost(
        mockPost.id,
        mockRequest,
        mockResponse,
      );

      expect(result).toEqual({ id: mockPost.id });
      expect(mockPostService.deletePost).toHaveBeenCalledWith(
        mockPost.id,
        mockRequest.cookies.userId,
      );
      expect(mockResponse.badRequest).not.toHaveBeenCalled();
      expect(mockResponse.unauthorized).not.toHaveBeenCalled();
    });

    it("should return error if post didn't exist", async () => {
      mockPostService.deletePost.mockResolvedValueOnce(null);

      const result = await postsController.deletePost(
        mockPost.id,
        mockRequest,
        mockResponse,
      );

      expect(result).toBe('badRequest called');
      expect(mockPostService.deletePost).toHaveBeenCalledWith(
        mockPost.id,
        mockRequest.cookies.userId,
      );
      expect(mockResponse.badRequest).toHaveBeenCalled();
      expect(mockResponse.unauthorized).not.toHaveBeenCalled();
    });

    it('should return error if user is not allowed to delete post', async () => {
      mockPostService.deletePost.mockResolvedValueOnce({
        PrivilegeError: true,
      });

      const result = await postsController.deletePost(
        mockPost.id,
        mockRequest,
        mockResponse,
      );

      expect(result).toBe('unauthorized called');
      expect(mockPostService.deletePost).toHaveBeenCalledWith(
        mockPost.id,
        mockRequest.cookies.userId,
      );
      expect(mockResponse.badRequest).not.toHaveBeenCalled();
      expect(mockResponse.unauthorized).toHaveBeenCalled();
    });
  });

  describe('create comment', () => {
    const mockResponse = {
      badRequest: jest.fn().mockReturnValue('badRequest called'),
    } as unknown as FastifyReply;
    const newCommentText = 'lorem ipsum';
    const newCommentParent = mockComment.id;

    it('should create a new comment under a post', async () => {
      const result = await postsController.createComment(
        mockPost.id,
        mockRequest,
        { message: newCommentText, parentId: newCommentParent },
        mockResponse,
      );

      expect(result).toBe(mockComment.id);
      expect(mockCommentService.createComment).toHaveBeenCalledWith({
        message: newCommentText,
        postId: mockPost.id,
        parentId: newCommentParent,
        userId: mockRequest.cookies.userId,
      });
      expect(mockResponse.badRequest).not.toHaveBeenCalled();
    });

    it("should return error if message didn't exist", async () => {
      const result = await postsController.createComment(
        mockPost.id,
        mockRequest,
        {},
        mockResponse,
      );

      expect(result).toBe('badRequest called');
      expect(mockPostService.getPostWithComments).not.toHaveBeenCalled();
      expect(mockResponse.badRequest).toHaveBeenCalled();
    });
  });
});
