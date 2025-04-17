import { Test, TestingModule } from '@nestjs/testing';
import { FastifyRequest, FastifyReply } from 'fastify';
import { CommentsController } from './comments.controller';
import { CommentService } from '../../../src/services/comment/comment.service';
import { mockComment } from '../../../test/mocks';

describe('CommentsController', () => {
  let commentsController: CommentsController;

  const mockCommentsService = {
    updateComment: jest.fn().mockResolvedValue(mockComment.id),
    deleteComment: jest.fn().mockResolvedValue(mockComment.id),
    toggleLike: jest.fn().mockResolvedValue({ isLikeAdded: true }),
  };

  const mockRequest = {
    cookies: { userId: 'fakeUserID' },
  } as unknown as FastifyRequest;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentsController],
      providers: [CommentService],
    })
      .overrideProvider(CommentService)
      .useValue(mockCommentsService)
      .compile();

    commentsController = module.get<CommentsController>(CommentsController);
  });

  it('should be defined', () => {
    expect(commentsController).toBeDefined();
  });

  describe('update comment', () => {
    const mockResponse = {
      badRequest: jest.fn().mockReturnValue('badRequest called'),
      unauthorized: jest.fn().mockReturnValue('unauthorized called'),
    } as unknown as FastifyReply;
    const updatedMessage = 'updated comment message';

    it('should update an existing comment', async () => {
      const result = await commentsController.updateComment(
        mockComment.id,
        mockRequest,
        { message: updatedMessage },
        mockResponse,
      );

      expect(result).toBe(mockComment.id);
      expect(mockResponse.badRequest).not.toHaveBeenCalled();
      expect(mockResponse.unauthorized).not.toHaveBeenCalled();
    });

    it('should return error if message is missing', async () => {
      const result = await commentsController.updateComment(
        mockComment.id,
        mockRequest,
        {},
        mockResponse,
      );

      expect(result).toBe('badRequest called');
      expect(mockResponse.badRequest).toHaveBeenCalled();
      expect(mockResponse.unauthorized).not.toHaveBeenCalled();
    });

    it("should return error if comment didn't exist", async () => {
      mockCommentsService.updateComment.mockResolvedValueOnce(null);

      const result = await commentsController.updateComment(
        mockComment.id,
        mockRequest,
        { message: updatedMessage },
        mockResponse,
      );

      expect(result).toBe('badRequest called');
      expect(mockResponse.badRequest).toHaveBeenCalled();
      expect(mockResponse.unauthorized).not.toHaveBeenCalled();
    });

    it('should return error if user is not allowed to update comment', async () => {
      mockCommentsService.updateComment.mockResolvedValueOnce({
        PrivilegeError: true,
      });

      const result = await commentsController.updateComment(
        mockComment.id,
        mockRequest,
        { message: updatedMessage },
        mockResponse,
      );

      expect(result).toBe('unauthorized called');
      expect(mockResponse.badRequest).not.toHaveBeenCalled();
      expect(mockResponse.unauthorized).toHaveBeenCalled();
    });
  });

  describe('delete comment', () => {
    const mockResponse = {
      badRequest: jest.fn().mockReturnValue('badRequest called'),
      unauthorized: jest.fn().mockReturnValue('unauthorized called'),
    } as unknown as FastifyReply;

    it('should delete an existing comment', async () => {
      const result = await commentsController.deleteComment(
        mockComment.id,
        mockRequest,
        mockResponse,
      );

      expect(result).toBe(mockComment.id);
      expect(mockResponse.badRequest).not.toHaveBeenCalled();
      expect(mockResponse.unauthorized).not.toHaveBeenCalled();
    });

    it("should return error if comment didn't exist", async () => {
      mockCommentsService.deleteComment.mockResolvedValueOnce(null);

      const result = await commentsController.deleteComment(
        mockComment.id,
        mockRequest,
        mockResponse,
      );

      expect(result).toBe('badRequest called');
      expect(mockResponse.badRequest).toHaveBeenCalled();
      expect(mockResponse.unauthorized).not.toHaveBeenCalled();
    });

    it('should return error if user is not allowed to delete comment', async () => {
      mockCommentsService.deleteComment.mockResolvedValueOnce({
        PrivilegeError: true,
      });

      const result = await commentsController.deleteComment(
        mockComment.id,
        mockRequest,
        mockResponse,
      );

      expect(result).toBe('unauthorized called');
      expect(mockResponse.badRequest).not.toHaveBeenCalled();
      expect(mockResponse.unauthorized).toHaveBeenCalled();
    });
  });

  it('should toggle like', async () => {
    const result = await commentsController.toggleLike(
      mockComment.id,
      mockRequest,
    );

    expect(result).toEqual({ isLikeAdded: true });
    expect(mockCommentsService.toggleLike).toHaveBeenCalledWith(
      mockComment.id,
      mockRequest.cookies.userId,
    );
  });
});
