import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginService } from '../../../services/login.service';
import { IconBtnComponent } from '../../UI/icon-btn/icon-btn.component';
import { TooltipDirective } from '../../UI/tooltip/tooltip.directive';
import { ConfirmPopupDirective } from '../../delete-post-dialog/confirm-popup.directive';
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
export class PostItemComponent implements OnInit {
  @Input() id: string = '';
  @Input() slug: string = '';
  @Input() title: string = '';
  @Input() uploader: userType = { email: '', name: '' };
  @Input() uploadedSince: string = '';
  @Input() isDeleting: boolean = false;
  @Output() onClick = new EventEmitter<string>();
  @Output() onDeleteClick = new EventEmitter<string>();
  @Output() onHighlightChanged = new EventEmitter<boolean>();

  constructor(private loginService: LoginService) {}

  isHighlighted = false;
  isAnimating = false;
  isAuthorLoggedIn:
    | ReturnType<typeof this.loginService.doesUserHaveAccess>
    | undefined;

  ngOnInit(): void {
    this.isAuthorLoggedIn = this.loginService.doesUserHaveAccess(
      this.uploader.email,
    );
  }

  get authorLoggedIn() {
    return this.isAuthorLoggedIn?.() ?? false;
  }

  postItemClicked(e: Event) {
    e.preventDefault();
    this.onClick.emit(this.slug);
  }

  deleteButtonClicked() {
    this.isDeleting = true;
    this.onDeleteClick.emit(this.id);
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
