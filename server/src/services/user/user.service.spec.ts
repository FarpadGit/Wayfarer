import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserService } from './user.service';
import { User } from '../../../src/entities/user.entity';
import { MockType } from '../../../test/types';

describe('UserService', () => {
  let userService: UserService;
  let mockUserRepo: MockType<Repository<User>>;

  const repositoryMockFactory: () => MockType<Repository<any>> = jest.fn(
    () => ({
      findOne: jest.fn((entity) => entity),
      create: jest.fn((entity) => entity),
      save: jest.fn((entity) => entity),
    }),
  );

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    mockUserRepo = module.get(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  it('should return the admin user', async () => {
    mockUserRepo.findOne?.mockResolvedValueOnce({ id: 'fakeAdminUserID' });

    const result = await userService.getAdminId();

    expect(result).toBe('fakeAdminUserID');
  });

  it('should return the guest user', async () => {
    mockUserRepo.findOne?.mockResolvedValueOnce({ id: 'fakeGuestUserID' });

    const result = await userService.getGuestId();

    expect(result).toBe('fakeGuestUserID');
  });

  describe('create user if new', () => {
    const user = {
      name: 'Fake User',
      email: 'user@email.com',
      sub: '12345',
    };

    it('should return a user if it exist', async () => {
      mockUserRepo.findOne?.mockResolvedValueOnce({ id: 'fakeUserID' });

      const result = await userService.createUserIfNew(user);

      expect(result).toBe('fakeUserID');
      expect(mockUserRepo.create).not.toHaveBeenCalled();
      expect(mockUserRepo.save).not.toHaveBeenCalled();
    });

    it("should create a new user if it doesn't exist", async () => {
      mockUserRepo.findOne?.mockResolvedValueOnce(null);
      mockUserRepo.create?.mockReturnValueOnce({
        id: 'fakeCreatedUser',
        email: 'user@email.com',
        name: 'Fake User',
      });

      const result = await userService.createUserIfNew(user);

      expect(result).toBe('fakeCreatedUser');
      expect(mockUserRepo.create).toHaveBeenCalled();
      expect(mockUserRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'user@email.com', name: 'Fake User' }),
      );
    });
  });
});
