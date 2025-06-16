import { Test, TestingModule } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import fastifyCookie from '@fastify/cookie';
import sensible from '@fastify/sensible';
import { AppModule } from '../src/app.module';
import { User } from '../src/db/entities/user.entity';
import { Category } from '../src/db/entities/category.entity';
import { Post } from '../src/db/entities/post.entity';
import { Image } from '../src/db/entities/image.entity';
import { Like } from '../src/db/entities/like.entity';
import { Comment } from '../src/db/entities/comment.entity';
import { MockType } from './types';
import {
  mockAdmin,
  mockCategory,
  mockComment,
  mockGuest,
  mockImage,
  mockLike,
  mockPost,
  mockUser,
} from './mocks';
import { assertionsForCategories } from './assertions/categories';
import { assertionsForPosts } from './assertions/posts';
import { assertionsForImages } from './assertions/images';
import { assertionsForComments } from './assertions/comments';
import { assertionsForAuthentication } from './assertions/auth';

// parses date string into Date, used by JSON.parse
export function dateTimeReviver(key: string, value: any) {
  if (typeof value === 'string') {
    const asNumber = Number(value);
    const asDate = Date.parse(value);
    if (isNaN(asDate) || !isNaN(asNumber)) return value;
    return new Date(value);
  }
  return value;
}

// 'it' assertions are grouped into separate files,
// they access values from exported variables
export let app: NestFastifyApplication;
export let mockUserRepo: MockType<Repository<User>>;
export let mockCategoryRepo: MockType<Repository<Category>>;
export let mockPostRepo: MockType<Repository<Post>>;
export let mockImageRepo: MockType<Repository<Image>>;
export let mockCommentRepo: MockType<Repository<Comment>>;
export let mockLikeRepo: MockType<Repository<Like>>;
export let mockImageServerUtils: {
  postImagesToImageServer: (payload: string) => Promise<void>;
  deleteImageFromImageServer: (images: string[]) => Promise<void>;
};

describe('AppController (e2e)', () => {
  // mocking out TypeORM query and mutation functions
  // findOne variations are redirected to findOne
  const repositoryMockFactory: () => MockType<Repository<any>> = jest.fn(
    () => ({
      find: jest.fn((entity) => entity),
      findOne: jest.fn((entity) => entity),
      findOneOrFail: jest.fn(function (entity) {
        return this.findOne(entity);
      }),
      findOneByOrFail: jest.fn(function (entity) {
        return this.findOne(entity);
      }),
      create: jest.fn((entity) => entity),
      save: jest.fn((entity) => entity),
      update: jest.fn((entity) => entity),
      remove: jest.fn((entity) => entity),
    }),
  );

  // userService reads the database on constructor initialization, before its results are mocked,
  // so it gets a custom mock factory that is the same as the generic one but FindOne is overridden.
  // the other mock response set ups can wait until after that.
  const userRepositoryMockFactory = () => {
    const _factory = repositoryMockFactory();
    _factory.findOne?.mockImplementation((input) => {
      if (input?.where?.email === mockAdmin.name)
        return Promise.resolve({ id: mockAdmin.id });
      if (input?.where?.email === mockGuest.name)
        return Promise.resolve({ id: mockGuest.id });
      return Promise.resolve({ id: mockUser.id });
    });
    return _factory;
  };

  beforeAll(async () => {
    jest.mock('../src/services/image/imageServer.utils', () => {
      return {
        postImagesToImageServer: jest.fn(),
        deleteImageFromImageServer: jest.fn(),
      };
    });

    mockImageServerUtils = await import(
      '../src/services/image/imageServer.utils'
    );
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(getRepositoryToken(User))
      .useFactory({ factory: userRepositoryMockFactory })
      .overrideProvider(getRepositoryToken(Category))
      .useFactory({ factory: repositoryMockFactory })
      .overrideProvider(getRepositoryToken(Post))
      .useFactory({ factory: repositoryMockFactory })
      .overrideProvider(getRepositoryToken(Image))
      .useFactory({ factory: repositoryMockFactory })
      .overrideProvider(getRepositoryToken(Comment))
      .useFactory({ factory: repositoryMockFactory })
      .overrideProvider(getRepositoryToken(Like))
      .useFactory({ factory: repositoryMockFactory })
      .compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );

    mockUserRepo = moduleFixture.get(getRepositoryToken(User));
    mockCategoryRepo = moduleFixture.get(getRepositoryToken(Category));
    mockPostRepo = moduleFixture.get(getRepositoryToken(Post));
    mockImageRepo = moduleFixture.get(getRepositoryToken(Image));
    mockCommentRepo = moduleFixture.get(getRepositoryToken(Comment));
    mockLikeRepo = moduleFixture.get(getRepositoryToken(Like));

    mockUserRepo.findOneByOrFail?.mockImplementation((input) => {
      if (input.id === mockAdmin.id) return Promise.resolve(mockAdmin);
      if (input.id === mockGuest.id) return Promise.resolve(mockGuest);
      return Promise.resolve(mockUser);
    });
    mockUserRepo.create?.mockReturnValue(mockUser);
    mockCategoryRepo.find?.mockResolvedValue([mockCategory, mockCategory]);
    mockCategoryRepo.findOne?.mockResolvedValue(mockCategory);
    mockPostRepo.find?.mockResolvedValue([mockPost, mockPost]);
    mockPostRepo.findOne?.mockResolvedValue(mockPost);
    mockImageRepo.findOne?.mockResolvedValue(mockImage);
    mockCommentRepo.find?.mockResolvedValue([mockComment, mockComment]);
    mockCommentRepo.findOne?.mockResolvedValue(mockComment);
    mockLikeRepo.find?.mockResolvedValue([mockLike]);

    await app.init();
    await app.register(sensible);
    await app.register(fastifyCookie, {
      secret: process.env.COOKIE_SECRET,
      parseOptions: { sameSite: 'none', secure: true },
    });
    await app.getHttpAdapter().getInstance().ready();
  });

  assertionsForCategories();
  assertionsForPosts();
  assertionsForImages();
  assertionsForComments();
  assertionsForAuthentication();

  afterEach(async () => {
    await app.close();
  });
});
