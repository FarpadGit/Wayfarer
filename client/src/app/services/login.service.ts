import { computed, Injectable, signal } from '@angular/core';
import { ApiService } from './API/api.service';
import { AuthConfig, OAuthService } from 'angular-oauth2-oidc';
import { Router } from '@angular/router';

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
    private oAuthService: OAuthService,
    private router: Router,
  ) {
    const authConfig: AuthConfig = {
      issuer: 'https://accounts.google.com',
      strictDiscoveryDocumentValidation: false,
      responseType: 'code',
      dummyClientSecret: import.meta.env['NG_APP_GOOGLE_SECRET'],
      clientId: import.meta.env['NG_APP_GOOGLE_CLIENTID'],
      redirectUri: window.location.origin + '/redirect',
      scope: 'openid profile email',
    };

    this.oAuthService.configure(authConfig);
    this.oAuthService.setupAutomaticSilentRefresh();
    this.oAuthService.loadDiscoveryDocumentAndTryLogin();
    this.oAuthService.events.subscribe(async (event) => {
      if (event.type === 'token_received') {
        this.loginUser({
          email: this.currentUserEmail(),
          display: this.currentUserName(),
        });
        const redirectUrl = decodeURIComponent(this.oAuthService.state ?? '/');
        await this.router.navigateByUrl(redirectUrl);
      }
    });
  }

  // OAuthService is not signal based by default, so if we want to react to a login or logout event, we need to makeshift it.
  private loginSignal = signal(1);

  loginUser(user?: { email: string; display: string }) {
    if (!user) this.oAuthService.initCodeFlow(window.location.pathname);
    else if (user.email === import.meta.env['NG_APP_ADMIN_EMAIL'])
      this.apiService.validateUser(userAccounts.ADMIN);
    else this.apiService.validateUser(user);
    this.loginSignal.update((prev) => prev + 1);
  }

  async logoutUser() {
    try {
      await this.oAuthService.revokeTokenAndLogout();
    } catch (_) {}
    this.loginSignal.update((prev) => prev + 1);
    this.oAuthService.logOut();
  }

  doesUserHaveAccess(email: string) {
    return computed(
      () =>
        this.currentUserEmail() === email ||
        this.currentUserEmail() === import.meta.env['NG_APP_ADMIN_EMAIL'],
    );
  }

  get isCurrentUserSignedIn() {
    return (
      this.loginSignal() > 0 && this.oAuthService.getIdentityClaims() !== null
    );
  }

  get isCurrentUserAdmin() {
    return this.currentUserEmail() === import.meta.env['NG_APP_ADMIN_EMAIL'];
  }

  get currentUserName() {
    return computed(() => {
      this.loginSignal();
      const { name } = this.oAuthService.getIdentityClaims() ?? {};
      return (name as string | undefined) ?? userAccounts.GUEST.display;
    });
  }

  get currentUserEmail() {
    return computed(() => {
      this.loginSignal();
      const { email } = this.oAuthService.getIdentityClaims() ?? {};
      return (email as string | undefined) ?? userAccounts.GUEST.email;
    });
  }
}
