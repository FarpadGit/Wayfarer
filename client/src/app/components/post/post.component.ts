import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { commentType } from '../../types';
import { PostService } from '../../services/post.service';
import { AsyncService } from '../../services/async.service';
import { ApiService } from '../../services/api.service';
import { TransitionService } from '../../services/transition.service';
import { AnimationService } from '../../services/animation.service';
import { LoaderComponent } from '../UI/loader/loader.component';
import { CommentFormComponent } from '../UI/comment-form/comment-form.component';
import { CommentListComponent } from '../comment-list/comment-list.component';
import { IconBtnComponent } from '../UI/icon-btn/icon-btn.component';
import { LinkyModule } from 'ngx-linky';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { matArrowBack } from '@ng-icons/material-icons/baseline';

@Component({
  selector: 'app-post',
  standalone: true,
  imports: [
    CommonModule,
    LoaderComponent,
    IconBtnComponent,
    NgIconComponent,
    CommentFormComponent,
    CommentListComponent,
    LinkyModule,
  ],
  providers: [PostService],
  templateUrl: './post.component.html',
  styleUrl: './post.component.scss',
  viewProviders: [provideIcons({ matArrowBack })],
})
export class PostComponent implements OnInit, OnDestroy {
  constructor(
    private postService: PostService,
    private asyncService: AsyncService,
    private APIService: ApiService,
    private transitionService: TransitionService,
    private animationService: AnimationService
  ) {}

  get loadingState() {
    if (this.postService.loading) return 'loading';
    if (this.postService.error) return 'error';
    return 'success';
  }
  get error() {
    return this.postService.error;
  }
  get post() {
    return this.postService.post;
  }
  get comments() {
    return this.postService.comments;
  }

  get animationState() {
    return this.animationService.bgAnimationState;
  }
  get rootComments() {
    return this.postService.rootComments;
  }

  commentsLoading = false;
  commentsError: string | null = null;
  private createCommentFn = this.asyncService.asAsyncFn<commentType>((args) =>
    this.APIService.createComment(args)
  );
  private commentsLoadingSub: Subscription | null = null;
  private commentsErrorSub: Subscription | null = null;

  ngOnInit(): void {
    this.commentsLoadingSub = this.createCommentFn.loading.subscribe(
      (loading) => (this.commentsLoading = loading)
    );
    this.commentsErrorSub = this.createCommentFn.error.subscribe(
      (err) => (this.commentsError = err)
    );
  }

  ngOnDestroy(): void {
    this.commentsLoadingSub?.unsubscribe();
    this.commentsErrorSub?.unsubscribe();
  }

  get delayStyle() {
    if (this.animationState === 'entered')
      return { '--post-entry-delay': '0.5s' };
    return undefined;
  }

  onCommentCreate(message: string) {
    this.createCommentFn
      .execute({ postId: this.postService.id, message })
      .then((comment) => this.postService.createLocalComment(comment));
  }

  backButtonClicked() {
    this.animationService.startExitAnimation();
    setTimeout(() => this.transitionService.callNavigate('/'), 1000);
  }
}
