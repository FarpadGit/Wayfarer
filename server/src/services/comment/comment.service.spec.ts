import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommentService } from './comment.service';
import { UserService } from '../user/user.service';
import { User } from '../../../src/entities/user.entity';
import { Post } from '../../../src/entities/post.entity';
import { Comment } from '../../../src/entities/comment.entity';
import { Like } from '../../../src/entities/like.entity';
import { MockType } from '../../../test/types';
import { mockComment, mockPost, mockUser, mockLike } from '../../../test/mocks';

describe('CommentService', () => {
  let commentService: CommentService;
  let mockUserRepo: MockType<Repository<User>>;
  let mockPostRepo: MockType<Repository<Post>>;
  let mockCommentRepo: MockType<Repository<Comment>>;
  let mockLikeRepo: MockType<Repository<Like>>;

  const mockUserService = {
    ADMIN_USER_ID: 'fakeAdminUserID',
  };

  const repositoryMockFactory: () => MockType<Repository<any>> = jest.fn(
    () => ({
      findOne: jest.fn((entity) => entity),
      findOneOrFail: jest.fn((entity) => entity),
      findOneByOrFail: jest.fn((entity) => entity),
      save: jest.fn((entity) => entity),
      update: jest.fn((entity) => entity),
      remove: jest.fn((entity) => entity),
    }),
  );

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentService,
        UserService,
        {
          provide: getRepositoryToken(User),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Post),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Comment),
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

    commentService = module.get<CommentService>(CommentService);
    mockUserRepo = module.get(getRepositoryToken(User));
    mockPostRepo = module.get(getRepositoryToken(Post));
    mockCommentRepo = module.get(getRepositoryToken(Comment));
    mockLikeRepo = module.get(getRepositoryToken(Like));

    mockUserRepo.findOneByOrFail?.mockResolvedValue(mockUser);
    mockPostRepo.findOneByOrFail?.mockResolvedValue(mockPost);
    mockCommentRepo.findOne?.mockResolvedValue(mockComment);
    mockCommentRepo.findOneByOrFail?.mockResolvedValue(mockComment);
    mockLikeRepo.findOne?.mockResolvedValue(null);
    mockLikeRepo.findOneByOrFail?.mockResolvedValue(null);
  });

  it('should be defined', () => {
    expect(commentService).toBeDefined();
  });

  it('should create a new comment', async () => {
    const newComment = {
      message: 'New Comment message',
      postId: mockPost.id,
      parentId: mockComment.id,
      userId: mockUser.id,
    };

    await commentService.createComment(newComment);

    expect(mockCommentRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        message: newComment.message,
        user: mockUser,
        parent: mockComment,
        post: mockPost,
      }),
    );
  });

  it('should get user who wrote a comment', async () => {
    const result = await commentService.getCommentAuthorId(mockComment.id);

    expect(result).toBe(mockUser.id);
  });

  describe('update comment', () => {
    const newComment = {
      id: mockComment.id,
      message: 'updated comment message',
      userId: mockUser.id,
    };

    it('should udate an existing comment', async () => {
      const result = await commentService.updateComment(newComment);

      expect(result).toEqual({ id: mockComment.id });
      expect(mockCommentRepo.update).toHaveBeenCalled();
    });

    it("should return null if comment doesn't exist", async () => {
      mockCommentRepo.findOne?.mockResolvedValueOnce(null);

      const result = await commentService.updateComment(newComment);

      expect(result).toBe(null);
      expect(mockCommentRepo.update).not.toHaveBeenCalled();
    });

    it('should return PrivilegeError if user is not allowed to update comment', async () => {
      const result = await commentService.updateComment({
        ...newComment,
        userId: 'bad User ID',
      });

      expect(result).toHaveProperty('PrivilegeError');
      expect(mockCommentRepo.update).not.toHaveBeenCalled();
    });

    it("should update someone else's comment if user is admin", async () => {
      const result = await commentService.updateComment({
        ...newComment,
        userId: mockUserService.ADMIN_USER_ID,
      });

      expect(result).toEqual({ id: mockComment.id });
      expect(mockCommentRepo.update).toHaveBeenCalled();
    });
  });

  describe('delete comment', () => {
    it('should delete an existing comment', async () => {
      const result = await commentService.deleteComment(
        mockComment.id,
        mockUser.id,
      );

      expect(result).toBe(mockComment.id);
      expect(mockCommentRepo.remove).toHaveBeenCalledWith(mockComment);
    });

    it("should return null if comment doesn't exist", async () => {
      mockCommentRepo.findOne?.mockResolvedValueOnce(null);

      const result = await commentService.deleteComment(
        mockComment.id,
        mockUser.id,
      );

      expect(result).toBe(null);
      expect(mockCommentRepo.remove).not.toHaveBeenCalled();
    });

    it('should return PrivilegeError if user is not allowed to delete comment', async () => {
      const result = await commentService.deleteComment(
        mockComment.id,
        'bad User ID',
      );

      expect(result).toHaveProperty('PrivilegeError');
      expect(mockCommentRepo.remove).not.toHaveBeenCalled();
    });

    it("should delete someone else's comment if user is admin", async () => {
      const result = await commentService.deleteComment(
        mockComment.id,
        mockUserService.ADMIN_USER_ID,
      );

      expect(result).toBe(mockComment.id);
      expect(mockCommentRepo.remove).toHaveBeenCalledWith(mockComment);
    });
  });

  describe('toggle like', () => {
    it('should toggle like (on)', async () => {
      const result = await commentService.toggleLike(
        mockComment.id,
        mockUser.id,
      );

      expect(result).toEqual({ isLikeAdded: true });
      expect(mockLikeRepo.save).toHaveBeenCalledWith(mockLike);
    });

    it('should toggle like (off)', async () => {
      mockLikeRepo.findOne?.mockResolvedValueOnce(mockLike);
      mockLikeRepo.findOneOrFail?.mockResolvedValueOnce(mockLike);

      const result = await commentService.toggleLike(
        mockComment.id,
        mockUser.id,
      );

      expect(result).toEqual({ isLikeAdded: false });
      expect(mockLikeRepo.remove).toHaveBeenCalledWith(mockLike);
    });
  });
});
