import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { PostListService } from '../../../services/post-list.service';
import {
  NewPostDialogComponent,
  newPostType,
} from '../../new-post-dialog/new-post-dialog.component';
import { ModalService } from 'ngx-modal-ease';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { matPostAdd } from '@ng-icons/material-icons/baseline';
import { IconBtnComponent } from '../icon-btn/icon-btn.component';

@Component({
  selector: 'app-new-post-button',
  standalone: true,
  imports: [IconBtnComponent, NgIconComponent],
  templateUrl: './new-post-button.component.html',
  styleUrl: './new-post-button.component.scss',
  viewProviders: [
    provideIcons({
      matPostAdd,
    }),
  ],
})
export class NewPostButtonComponent implements OnDestroy {
  constructor(
    private modalService: ModalService,
    private postListService: PostListService
  ) {}

  loading: boolean = false;
  private dialogSub: Subscription | null = null;

  async open() {
    const response = await this.modalService.open(NewPostDialogComponent, {
      modal: {
        enter: 'new-post-dialog-enter 0.5s ease',
        leave: 'new-post-dialog-exit 0.5s ease',
      },
      overlay: {
        backgroundColor: '#010809e5',
      },
    });

    if (response.data) {
      this.loading = true;
      await this.createPost(response.data as newPostType);
      this.loading = false;
    }
  }

  async createPost(newPost: newPostType) {
    const { title, body, files } = newPost;
    const categoryId = this.postListService.getCurrentCategory();
    await this.postListService.createPost(title, body, files, categoryId);
  }

  ngOnDestroy(): void {
    this.dialogSub?.unsubscribe();
  }
}
