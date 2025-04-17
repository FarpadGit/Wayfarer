import { Test, TestingModule } from '@nestjs/testing';
import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthController } from './auth.controller';
import { UserService } from '../../services/user/user.service';

describe('AuthController', () => {
  let authController: AuthController;

  const mockUserService = {
    GUEST_USER_ID: 'fakeGuestUserID',
    createUserIfNew: jest.fn().mockReturnValue('fakeUserID'),
  };

  const mockRequest = {
    cookies: { userId: '' },
  } as unknown as FastifyRequest;
  const mockResponse = {
    clearCookie: jest.fn(),
    setCookie: jest.fn(),
  } as unknown as FastifyReply;

  beforeEach(async () => {
    mockUserService.createUserIfNew.mockClear();
    (mockResponse.setCookie as jest.Mock).mockClear();

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [UserService],
    })
      .overrideProvider(UserService)
      .useValue(mockUserService)
      .compile();

    authController = app.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  it('should set cookie with guest user', async () => {
    const mockBody = { userToken: undefined };
    const expectedUserID = mockUserService.GUEST_USER_ID;

    const result = await authController.login(
      mockRequest,
      mockBody,
      mockResponse,
    );

    expect(result).toBe(true);
    expect(mockRequest.cookies.userId).toBe(expectedUserID);
    expect(mockUserService.createUserIfNew).not.toHaveBeenCalled();
    expect(mockResponse.setCookie).toHaveBeenCalledWith(
      'userId',
      expectedUserID,
      expect.any(Object),
    );
  });

  it('should set cookie with guest user', async () => {
    const mockBody = {
      userToken: { email: 'user@email.com', name: 'Fake User', sub: '12345' },
    };
    const expectedUserID = mockUserService.createUserIfNew(mockBody.userToken);

    const result = await authController.login(
      mockRequest,
      mockBody,
      mockResponse,
    );

    expect(result).toBe(true);
    expect(mockRequest.cookies.userId).toBe(expectedUserID);
    expect(mockUserService.createUserIfNew).toHaveBeenCalled();
    expect(mockResponse.setCookie).toHaveBeenCalledWith(
      'userId',
      expectedUserID,
      expect.any(Object),
    );
  });
});
