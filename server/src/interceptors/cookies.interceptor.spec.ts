import { ExecutionContext } from '@nestjs/common';
import { catchError, of, throwError } from 'rxjs';
import { cookiesInterceptor } from './cookies.interceptor';
import { UserService } from '../services/user/user.service';

describe('CookiesInterceptor', () => {
  const mockUserService = {
    GUEST_USER_ID: 'MOCK_GUEST_USER_ID',
  };

  const interceptor = new cookiesInterceptor(
    mockUserService as unknown as UserService,
  );

  const mockRequest = {
    cookies: { userId: 'fakeUserID' as string | undefined },
  };
  const mockResponse = {
    clearCookie: jest.fn(),
    setCookie: jest.fn(),
    headers: jest.fn(),
    send: jest.fn().mockReturnValue('mocked Response'),
    internalServerError: jest.fn().mockReturnValue('mocked Error Response'),
  };

  // switchToHttp will return the object it is defined in, so calling
  // executionContext.switchToHttp().getRequest() is like calling executionContext.this.getRequest()
  const executionContext = {
    switchToHttp: jest.fn().mockReturnThis(),
    getRequest: jest.fn().mockReturnValue(mockRequest),
    getResponse: jest.fn().mockReturnValue(mockResponse),
  } as unknown as ExecutionContext;

  const callHandler = {
    handle: jest.fn().mockReturnValue(of({})),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest.cookies.userId = 'fakeUserID';
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should intercept and set cookies/headers', (done) => {
    interceptor.intercept(executionContext, callHandler).subscribe((result) => {
      // 'result' will actually be the original input and not the return statements in tap so testing it is unnecessary
      expect(mockResponse.setCookie).not.toHaveBeenCalled();
      expect(callHandler.handle).toHaveBeenCalledTimes(1);
      expect(mockResponse.headers).toHaveBeenCalledWith({
        userId: 'fakeUserID',
      });
      expect(mockResponse.send).toHaveBeenCalledTimes(1);
      expect(mockResponse.internalServerError).not.toHaveBeenCalled();
      done();
    });
  });

  it('should set userId header if not present', (done) => {
    mockRequest.cookies.userId = undefined;

    interceptor.intercept(executionContext, callHandler).subscribe((result) => {
      // 'result' will actually be the original input and not the return statements in tap so testing it is unnecessary
      expect(mockResponse.setCookie).toHaveBeenCalledWith(
        'userId',
        mockUserService.GUEST_USER_ID,
        expect.any(Object),
      );
      expect(callHandler.handle).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it('should return internalServerError on error', (done) => {
    callHandler.handle.mockReturnValueOnce(
      throwError(() => ({ message: 'mock error' })),
    );

    interceptor
      .intercept(executionContext, callHandler)
      .pipe(catchError(() => of('caught mock error')))
      .subscribe((result) => {
        expect(result).toBe('caught mock error');
        expect(callHandler.handle).toHaveBeenCalledTimes(1);
        expect(mockResponse.send).not.toHaveBeenCalled();
        expect(mockResponse.internalServerError).toHaveBeenCalledTimes(1);
        done();
      });
  });
});
