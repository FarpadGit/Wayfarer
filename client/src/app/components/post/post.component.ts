import { Component, Directive, ElementRef, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PostService } from '../../services/post.service';
import { TransitionService } from '../../services/transition.service';
import { AnimationService, bgStates } from '../../services/animation.service';
import { LoaderComponent } from '../UI/loader/loader.component';
import { CommentFormComponent } from '../UI/comment-form/comment-form.component';
import { CommentListComponent } from '../comment-list/comment-list.component';
import { IconBtnComponent } from '../UI/icon-btn/icon-btn.component';
import { LinkyModule } from 'ngx-linky';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import {
  matArrowBack,
  matEditNote,
  matSaveAll,
  matCancel,
} from '@ng-icons/material-icons/baseline';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';

@Directive({ selector: '[appAutofocus]', standalone: true })
export class AutofocusDirective implements OnInit {
  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {
    this.elementRef.nativeElement.focus();
  }
}

@Component({
  selector: 'app-post',
  standalone: true,
  imports: [
    FormsModule,
    LoaderComponent,
    IconBtnComponent,
    NgIconComponent,
    CommentFormComponent,
    CommentListComponent,
    LinkyModule,
    AutofocusDirective,
  ],
  providers: [PostService],
  templateUrl: './post.component.html',
  styleUrl: './post.component.scss',
  viewProviders: [
    provideIcons({ matArrowBack, matEditNote, matSaveAll, matCancel }),
  ],
  animations: [
    trigger('post-fade-in-out', [
      transition(':enter', [
        style({ opacity: 0, top: '20px' }),
        animate('0.5s 0.5s ease', style({ opacity: 1, top: '0px' })),
      ]),
      state(bgStates.exiting, style({ opacity: 0, left: '100px' })),
      transition('* => ' + bgStates.exiting, animate('0.5s ease')),
    ]),
  ],
})
export class PostComponent {
  constructor(
    private postService: PostService,
    private transitionService: TransitionService,
    private animationService: AnimationService,
  ) {}

  isEditMode = false;
  isEditLoading = false;
  hasEditError = false;
  editedPost = { title: '', body: '' };

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

  get authorLoggedIn() {
    return this.postService.isAuthorLoggedIn();
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
    if (this.isEditLoading) return;
    this.animationService.startExitAnimation();
    this.transitionService.callDelayedNavigate(1000, '/', true);
  }

  async onPostEdit() {
    if (this.isEditLoading) return;
    if (!this.isEditMode) {
      this.editedPost.title = this.post!.title;
      this.editedPost.body = this.post!.body;
      this.isEditMode = true;
    } else {
      this.isEditLoading = true;
      const newSlug = await this.postService.updatePost(
        this.post!.id,
        this.editedPost,
      );
      this.isEditLoading = false;
      this.isEditMode = false;

      if (newSlug == null) this.hasEditError = true;
      else this.transitionService.callNavigate('/posts/' + newSlug, true);
    }
  }

  onPostEditCancel() {
    if (!this.isEditLoading) this.isEditMode = false;
  }
}
