import { Component, Input, OnInit } from '@angular/core';
import { PostService } from '../../services/post.service';
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
export class CommentComponent implements OnInit {
  @Input() comment!: commentType;

  constructor(
    private postService: PostService,
    private loginService: LoginService,
  ) {}

  private dateFormatter = new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  isAuthorLoggedIn:
    | ReturnType<typeof this.loginService.doesUserHaveAccess>
    | undefined;

  ngOnInit(): void {
    this.isAuthorLoggedIn = this.loginService.doesUserHaveAccess(
      this.comment.user.email,
    );
  }

  get authorLoggedIn() {
    return this.isAuthorLoggedIn?.() ?? false;
  }

  get displayDate() {
    return this.dateFormatter.format(Date.parse(this.comment.createdAt || '0'));
  }

  isReplying = false;
  isEditing = false;
  isDeleting = false;
  get isLiked() {
    return this.comment.isLikedByMe;
  }

  get popupLocation() {
    if (window.matchMedia('(max-width:639px)').matches) return 'bottom';
    return 'right';
  }

  onCommentReply(message: string) {
    this.postService.createComment(message, this.comment.id);
    this.isReplying = false;
  }

  onCommentUpdate(message: string) {
    this.postService.updateComment(this.comment.id, message);
    this.isEditing = false;
  }

  onCommentDelete() {
    this.isDeleting = true;
    this.postService.deleteComment(this.comment.id);
  }

  onToggleCommentLike() {
    this.postService.toggleCommentLike(this.comment.id, !this.isLiked);
  }
}
