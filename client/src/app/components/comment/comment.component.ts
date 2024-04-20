import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { commentType } from '../../types';
import { PostService } from '../../services/post.service';
import { AsyncService } from '../../services/async.service';
import { ApiService } from '../../services/api.service';
import { LoginService } from '../../services/login.service';
import { CommentFormComponent } from '../UI/comment-form/comment-form.component';
import { IconBtnComponent } from '../UI/icon-btn/icon-btn.component';
import { TooltipDirective } from '../UI/tooltip/tooltip.directive';
import { ConfirmPopupDirective } from '../delete-post-dialog/confirm-popup.directive';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  matFavorite,
  matFavoriteBorder,
  matReply,
  matEdit,
  matDelete,
} from '@ng-icons/material-icons/baseline';

@Component({
  selector: 'app-comment',
  standalone: true,
  imports: [
    CommonModule,
    IconBtnComponent,
    NgIconComponent,
    CommentFormComponent,
    TooltipDirective,
    ConfirmPopupDirective,
  ],
  templateUrl: './comment.component.html',
  styleUrl: './comment.component.scss',
  viewProviders: [
    provideIcons({
      matFavorite,
      matFavoriteBorder,
      matReply,
      matEdit,
      matDelete,
    }),
  ],
})
export class CommentComponent {
  @Input() comment: commentType | null = null;

  constructor(
    private apiService: ApiService,
    private postService: PostService,
    private asyncService: AsyncService,
    private loginService: LoginService
  ) {}

  private dateFormatter = new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  get displayDate() {
    return this.dateFormatter.format(
      Date.parse(this.comment?.createdAt || '0')
    );
  }

  get authorLoggedIn() {
    return (
      this.loginService.currentUserId === this.comment?.user.id ||
      this.loginService.currentUserEmail ===
        import.meta.env['NG_APP_ADMIN_EMAIL']
    );
  }

  isLoadingChanges = false;
  isReplying = false;
  isEditing = false;
  get isLiked() {
    return this.comment?.isLikedByMe || false;
  }

  createCommentFn = this.asyncService.asAsyncFn((args) =>
    this.apiService.createComment(args)
  );

  updateCommentFn = this.asyncService.asAsyncFn((args) =>
    this.apiService.updateComment(args)
  );

  deleteCommentFn = this.asyncService.asAsyncFn((args) =>
    this.apiService.deleteComment(args)
  );

  toggleCommentLikeFn = this.asyncService.asAsyncFn((args) =>
    this.apiService.toggleCommentLike(args)
  );

  onCommentReply(message: string) {
    this.createCommentFn
      .execute({
        postId: this.postService.id,
        message,
        parentId: this.comment?.id,
      })
      .then((comment: commentType) => {
        this.isReplying = false;
        this.postService.createLocalComment(comment);
      });
  }

  onCommentUpdate(message: string) {
    this.updateCommentFn
      .execute({ postId: this.postService.id, message, id: this.comment?.id })
      .then((comment: commentType) => {
        this.isEditing = false;
        this.postService.updateLocalComment(this.comment!.id, comment.message);
      });
  }

  onCommentDelete() {
    this.isLoadingChanges = true;
    this.deleteCommentFn
      .execute({ postId: this.postService.id, id: this.comment?.id })
      .then((comment: commentType) => {
        this.isLoadingChanges = false;
        this.postService.deleteLocalComment(comment.id);
      });
  }

  onToggleCommentLike() {
    this.isLoadingChanges = true;
    this.toggleCommentLikeFn
      .execute({ id: this.comment?.id, postId: this.postService.id })
      .then(({ isLikeAdded }: { isLikeAdded: boolean }) => {
        this.isLoadingChanges = false;
        this.postService.toggleLocalCommentLike(this.comment!.id, isLikeAdded);
      });
  }
}
