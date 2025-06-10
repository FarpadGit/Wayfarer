import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { PostListService } from '../../../services/post-list.service';
import { NewPostDialogComponent } from '../../new-post-dialog/new-post-dialog.component';
import { ModalService } from 'ngx-modal-ease';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { matPostAdd } from '@ng-icons/material-icons/baseline';
import { postType } from '../../../types';

@Component({
  selector: 'app-new-post-button',
  standalone: true,
  imports: [NgIconComponent],
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
      const newPost = response.data as Omit<postType, 'comments'>;
      if (newPost.images!.length === 0) newPost.images = undefined;
      this.createPost(newPost);
    }
  }

  createPost(newPost: Omit<postType, 'comments'>) {
    const { title, body, images } = newPost;
    const categoryId = this.postListService.getCurrentCategory();
    this.postListService.createPost(title, body, images, categoryId);
  }

  ngOnDestroy(): void {
    this.dialogSub?.unsubscribe();
  }
}
