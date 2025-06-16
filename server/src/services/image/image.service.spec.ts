import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Image } from '../../db/entities/image.entity';
import { UserService } from '../user/user.service';
import { ImageService } from './image.service';
import { MockType } from '../../../test/types';
import { mockGuest, mockImage, mockUser } from '../../../test/mocks';

describe('ImageService', () => {
  let imageService: ImageService;
  let mockImageRepo: MockType<Repository<Image>>;

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
        ImageService,
        UserService,
        {
          provide: getRepositoryToken(Image),
          useFactory: repositoryMockFactory,
        },
      ],
    })
      .overrideProvider(UserService)
      .useValue(mockUserService)
      .compile();

    imageService = module.get<ImageService>(ImageService);
    mockImageRepo = module.get(getRepositoryToken(Image));

    mockImageRepo.findOne?.mockResolvedValue(mockImage);
  });

  it('should be defined', () => {
    expect(imageService).toBeDefined();
  });

  it("should return the uploader's ID of an image", async () => {
    const result = await imageService.getImageOwnerId('fakeImageID');

    expect(result).toEqual(mockUser.id);
  });

  it('should return whether a user is allowed to delete an attachment', async () => {
    const result1 = await imageService.canDeleteImage(
      'fakeImageID',
      mockUser.id,
    );
    const result2 = await imageService.canDeleteImage(
      'fakeImageID',
      mockGuest.id,
    );
    const result3 = await imageService.canDeleteImage(
      'fakeImageID',
      mockUserService.ADMIN_USER_ID,
    );

    expect(result1).toBe(true);
    expect(result2).toBe(false);
    expect(result3).toBe(true);
  });
});
