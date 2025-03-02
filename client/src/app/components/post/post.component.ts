import { Component } from '@angular/core';
import { PostService } from '../../services/post.service';
import { TransitionService } from '../../services/transition.service';
import { AnimationService, bgStates } from '../../services/animation.service';
import { LoaderComponent } from '../UI/loader/loader.component';
import { CommentFormComponent } from '../UI/comment-form/comment-form.component';
import { CommentListComponent } from '../comment-list/comment-list.component';
import { IconBtnComponent } from '../UI/icon-btn/icon-btn.component';
import { LinkyModule } from 'ngx-linky';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { matArrowBack } from '@ng-icons/material-icons/baseline';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';

@Component({
  selector: 'app-post',
  standalone: true,
  imports: [
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
  animations: [
    trigger('post-fade-in-out', [
      transition(':enter', [
        style({ opacity: 0, top: '20px' }),
        animate('0.5s 0.5s ease', style({ opacity: 1, top: '0px' })),
      ]),
      state(bgStates.exiting, style({ opacity: 0, left: '100px' })),
      transition('* => ' + bgStates.exiting, animate('0.5s ease')),
    ]),
    trigger('comment-fade-in-out', [
      transition(':enter', [
        style({ translate: '0 -20%', opacity: 0 }),
        animate('0.25s ease', style({ translate: '0 0%', opacity: 1 })),
      ]),
      transition(':leave', [
        animate('0.25s ease', style({ translate: '0 -20%', opacity: 0 })),
      ]),
    ]),
  ],
})
export class PostComponent {
  constructor(
    private postService: PostService,
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
    return this.postService.localComments();
  }

  get animationState() {
    return this.animationService.bgAnimationState;
  }
  get rootComments() {
    return this.postService.rootComments;
  }

  onCommentCreate(message: string) {
    this.postService.createComment(message);
  }

  backButtonClicked() {
    this.animationService.startExitAnimation();
    this.transitionService.callDelayedNavigate(1000, '/', true);
  }
}
