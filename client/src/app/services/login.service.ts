import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { AuthConfig, OAuthService } from 'angular-oauth2-oidc';

export const userAccounts = {
  GUEST: { email: 'WF_GUEST', display: 'Anonymus' },
  ADMIN: { email: 'WF_ADMIN', display: 'Admin' },
};

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  constructor(
    private apiService: ApiService,
    private oAuthService: OAuthService
  ) {
    const authConfig: AuthConfig = {
      issuer: 'https://accounts.google.com',
      strictDiscoveryDocumentValidation: false,
      responseType: 'code',
      dummyClientSecret: import.meta.env['NG_APP_GOOGLE_SECRET'],
      clientId: import.meta.env['NG_APP_GOOGLE_CLIENTID'],
      redirectUri: window.location.origin,
      scope: 'openid profile email',
    };

    this.oAuthService.configure(authConfig);
    this.oAuthService.setupAutomaticSilentRefresh();
    this.oAuthService.loadDiscoveryDocumentAndTryLogin();
    this.oAuthService.events.subscribe((event) => {
      if (event.type === 'token_received') {
        this.loginUser({
          email: this.currentUserEmail,
          display: this.currentUserName,
        });
      }
    });
  }

  loginUser(user?: { email: string; display: string }) {
    if (!user) this.oAuthService.initCodeFlow();
    else if (user.email === import.meta.env['NG_APP_ADMIN_EMAIL'])
      this.apiService.validateUser(userAccounts.ADMIN);
    else this.apiService.validateUser(user);
  }

  async logoutUser() {
    await this.oAuthService.revokeTokenAndLogout();
    this.oAuthService.logOut();
  }

  get isCurrentUserSignedIn() {
    return this.oAuthService.getIdentityClaims() !== null;
  }

  get currentUserName() {
    return (
      this.oAuthService.getIdentityClaims()?.['name'] ??
      userAccounts.GUEST.display
    );
  }

  get currentUserEmail() {
    return (
      this.oAuthService.getIdentityClaims()?.['email'] ??
      userAccounts.GUEST.email
    );
  }
}
