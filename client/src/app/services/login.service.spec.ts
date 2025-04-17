import { TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';

import { LoginService, userAccounts } from './login.service';
import { ApiService } from './API/api.service';
import { mockUser } from '../../test/mocks';
import { OAuthEvent, OAuthService } from 'angular-oauth2-oidc';

describe('LoginService', () => {
  let service: LoginService;
  let apiSpy: jasmine.SpyObj<ApiService>;
  let oauthSpy: jasmine.SpyObj<OAuthService>;
  let oauthEvents: BehaviorSubject<OAuthEvent | {}>;

  beforeEach(() => {
    oauthEvents = new BehaviorSubject<OAuthEvent | {}>({});
    apiSpy = jasmine.createSpyObj('ApiService', ['validateUser']);
    oauthSpy = jasmine.createSpyObj(
      'OAuthService',
      [
        'configure',
        'setupAutomaticSilentRefresh',
        'loadDiscoveryDocumentAndTryLogin',
        'initCodeFlow',
        'revokeTokenAndLogout',
        'logOut',
        'getIdentityClaims',
      ],
      {
        events: oauthEvents,
      }
    );
    oauthSpy.getIdentityClaims.and.returnValue({
      name: mockUser.name,
      email: mockUser.email,
    });

    TestBed.configureTestingModule({
      providers: [
        { provide: ApiService, useValue: apiSpy },
        { provide: OAuthService, useValue: oauthSpy },
      ],
    });

    service = TestBed.inject(LoginService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initate oauth login flow', () => {
    service.loginUser();

    expect(oauthSpy.initCodeFlow).toHaveBeenCalled();
  });

  it('should log in user', () => {
    service.loginUser({ email: mockUser.email, display: mockUser.name });

    expect(apiSpy.validateUser).toHaveBeenCalledWith({
      email: mockUser.email,
      display: mockUser.name,
    });
  });

  it('should log in admin user', () => {
    service.loginUser({
      email: import.meta.env['NG_APP_ADMIN_EMAIL'],
      display: '',
    });

    expect(apiSpy.validateUser).toHaveBeenCalledWith(userAccounts.ADMIN);
  });

  it('should log out user', async () => {
    await service.logoutUser();

    expect(oauthSpy.revokeTokenAndLogout).toHaveBeenCalled();
    expect(oauthSpy.logOut).toHaveBeenCalled();
  });

  it('should return if current user is logged in', async () => {
    expect(service.isCurrentUserSignedIn).toBeTrue();

    oauthSpy.getIdentityClaims.and.returnValue(null as unknown as {});

    expect(service.isCurrentUserSignedIn).toBeFalse();
  });

  it("should return currently logged in user's name", async () => {
    expect(service.currentUserName).toBe(mockUser.name);
  });

  it("should return currently logged in user's email", async () => {
    expect(service.currentUserEmail).toBe(mockUser.email);
  });

  it("should return guest user's name", async () => {
    oauthSpy.getIdentityClaims.and.returnValue({});

    expect(service.currentUserName).toBe(userAccounts.GUEST.display);
  });

  it("should return guest user's email", async () => {
    oauthSpy.getIdentityClaims.and.returnValue({});

    expect(service.currentUserEmail).toBe(userAccounts.GUEST.email);
  });
});
