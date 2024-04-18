import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginService, userAccounts } from '../../services/login.service';
import { ModalService } from 'ngx-modal-ease';

@Component({
  selector: 'app-login-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login-dialog.component.html',
  styleUrl: './login-dialog.component.scss',
})
export class LoginDialogComponent {
  constructor(
    private loginService: LoginService,
    private modalService: ModalService
  ) {}

  @ViewChild('googleSignIn') googleSignInWrapper!: ElementRef<HTMLDivElement>;
  googleSignInButton: HTMLElement | null = null;

  get currentUserName() {
    return this.loginService.currentUserName;
  }
  get isGuestUser() {
    return this.loginService.currentUserName === userAccounts.GUEST.display;
  }

  async onLoginClick() {
    if (this.loginService.isCurrentUserSignedIn)
      await this.loginService.logoutUser();
    this.loginService.loginUser();
  }

  onLogoutClick() {
    this.loginService.logoutUser();
    this.loginService.loginUser(userAccounts.GUEST);
    this.dismiss();
  }

  dismiss() {
    this.modalService.close(null);
  }
}
