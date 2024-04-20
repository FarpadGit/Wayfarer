import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginService } from '../../services/login.service';
import { IconBtnComponent } from '../UI/icon-btn/icon-btn.component';
import { TooltipDirective } from '../UI/tooltip/tooltip.directive';
import { ConfirmPopupDirective } from '../delete-post-dialog/confirm-popup.directive';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { tablerEraser } from '@ng-icons/tabler-icons';

@Component({
  selector: 'app-post-item',
  standalone: true,
  imports: [
    CommonModule,
    IconBtnComponent,
    NgIconComponent,
    TooltipDirective,
    ConfirmPopupDirective,
  ],
  templateUrl: './post-item.component.html',
  styleUrl: './post-item.component.scss',
  viewProviders: [
    provideIcons({
      tablerEraser,
    }),
  ],
})
export class PostItemComponent {
  @Input() id: string = '';
  @Input() title: string = '';
  @Input() uploader: { id: string; name: string } = { id: '', name: '' };
  @Input() uploadedSince: string = '';
  @Output() onClick = new EventEmitter<string>();
  @Output() onDeleteClick = new EventEmitter<string>();

  isDeleting = false;

  constructor(private loginService: LoginService) {}

  highlighted = false;
  get authorLoggedIn() {
    return (
      this.loginService.currentUserId === this.uploader.id ||
      this.loginService.currentUserEmail ===
        import.meta.env['NG_APP_ADMIN_EMAIL']
    );
  }

  PostItemClicked(e: Event) {
    e.preventDefault();
    this.onClick.emit(this.id);
  }

  DeleteButtonClicked() {
    this.onDeleteClick.emit(this.id);
    this.isDeleting = true;
  }

  getUploadedSinceText(uploadDate: string) {
    if (isNaN(Date.parse(uploadDate))) return 'ismeretlen idő óta';
    const uploadedSince = new Date(Date.now() - Date.parse(uploadDate));

    if (uploadedSince.getFullYear() - 1970 > 0)
      return `${
        uploadedSince.getFullYear() - 1970
      } éve és ${uploadedSince.getMonth()} hónapja`;
    if (uploadedSince.getMonth() > 0)
      return `${uploadedSince.getMonth()} hónapja és ${
        uploadedSince.getDate() - 1
      } napja`;
    if (uploadedSince.getDate() - 1 > 0)
      return `${uploadedSince.getDate() - 1} napja`;
    if (uploadedSince.getHours() - 1 > 0)
      return `${uploadedSince.getHours()} órája és ${uploadedSince.getMinutes()} perce`;
    return `${uploadedSince.getMinutes()} perce`;
  }
}
