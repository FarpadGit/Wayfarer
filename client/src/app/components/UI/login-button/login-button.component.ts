import { Component } from '@angular/core';
import { LoginDialogComponent } from '../../login-dialog/login-dialog.component';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { matPerson2 } from '@ng-icons/material-icons/baseline';
import { ModalService } from 'ngx-modal-ease';

@Component({
  selector: 'app-login-button',
  standalone: true,
  imports: [NgIconComponent],
  templateUrl: './login-button.component.html',
  styleUrl: './login-button.component.scss',
  viewProviders: [
    provideIcons({
      matPerson2,
    }),
  ],
})
export class LoginButtonComponent {
  constructor(private modalService: ModalService) {}

  onClick(e: Event) {
    this.modalService.open(LoginDialogComponent, {
      size: {
        padding: '0',
      },
      modal: {
        top: 'calc(var(--app-login-drawer-height) / 2)',
        left: '50%',
        enter: 'login-dialog-enter 0.5s ease-out',
        leave: 'login-dialog-exit 0.5s ease-out',
      },
    });
  }
}
