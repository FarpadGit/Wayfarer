import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SeedService } from './seed.service';
import { User } from '../../../src/entities/user.entity';
import { Category } from '../../../src/entities/category.entity';
import { Post } from '../../../src/entities/post.entity';
import { Comment } from '../../../src/entities/comment.entity';
import { Like } from '../../../src/entities/like.entity';
import { MockType } from '../../../test/types';

describe('SeedServiceService', () => {
  let seedService: SeedService;
  let mockUserRepo: MockType<Repository<User>>;
  let mockCategoryRepo: MockType<Repository<Category>>;
  let mockPostRepo: MockType<Repository<Post>>;
  let mockCommentRepo: MockType<Repository<Comment>>;
  let mockLikeRepo: MockType<Repository<Like>>;

  const repositoryMockFactory: () => MockType<Repository<any>> = jest.fn(
    () => ({
      delete: jest.fn((entity) => entity),
      create: jest.fn((entity) => entity),
      save: jest.fn((entity) => entity),
    }),
  );

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeedService,
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
          provide: getRepositoryToken(Comment),
          useFactory: repositoryMockFactory,
        },
        {
          provide: getRepositoryToken(Like),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile();

    seedService = module.get<SeedService>(SeedService);
    mockUserRepo = module.get(getRepositoryToken(User));
    mockCategoryRepo = module.get(getRepositoryToken(Category));
    mockPostRepo = module.get(getRepositoryToken(Post));
    mockCommentRepo = module.get(getRepositoryToken(Comment));
    mockLikeRepo = module.get(getRepositoryToken(Like));
  });

  it('should be defined', () => {
    expect(seedService).toBeDefined();
  });

  it('should create some entries', async () => {
    await seedService.seed();

    expect(mockUserRepo.delete).toHaveBeenCalledTimes(1);
    expect(mockCategoryRepo.delete).toHaveBeenCalledTimes(1);
    expect(mockPostRepo.delete).toHaveBeenCalledTimes(1);
    expect(mockCommentRepo.delete).toHaveBeenCalledTimes(1);
    expect(mockLikeRepo.delete).toHaveBeenCalledTimes(1);

    expect(mockUserRepo.create).toHaveBeenCalledTimes(2);
    expect(mockCategoryRepo.create).toHaveBeenCalledTimes(1);

    expect(mockUserRepo.save).toHaveBeenCalled();
    expect(mockCategoryRepo.save).toHaveBeenCalled();
    expect(mockPostRepo.save).toHaveBeenCalled();
    expect(mockCommentRepo.save).toHaveBeenCalled();
    expect(mockLikeRepo.save).not.toHaveBeenCalled();
  });
});
