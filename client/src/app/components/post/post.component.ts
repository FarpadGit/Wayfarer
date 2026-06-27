import {
  Component,
  Directive,
  ElementRef,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
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
    CommonModule,
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
  styleUrls: ['./post.component.scss', './animations.scss'],
  viewProviders: [
    provideIcons({ matArrowBack, matEditNote, matSaveAll, matCancel }),
  ],
})
export class PostComponent {
  constructor(
    private postService: PostService,
    private transitionService: TransitionService,
    private animationService: AnimationService,
  ) {}

  isEditModeSignal = signal(false);
  isEditLoadingSignal = signal(false);
  hasEditErrorSignal = signal(false);
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
    return this.postService.isAuthorLoggedIn;
  }

  get animationState() {
    const filter = [bgStates.exiting];
    const state = this.animationService.bgAnimationState();
    return filter.includes(state) ? state : '';
  }
  get rootComments() {
    return this.postService.rootComments;
  }

  get isEditMode() {
    return this.isEditModeSignal();
  }
  get isEditLoading() {
    return this.isEditLoadingSignal();
  }
  get hasEditError() {
    return this.hasEditErrorSignal();
  }

  onCommentCreate(message: string) {
    this.postService.createComment(message);
  }

  backButtonClicked() {
    if (this.isEditLoadingSignal()) return;
    this.animationService.startExitAnimation();
    this.transitionService.callDelayedNavigate(1000, '/', true);
  }

  async onPostEdit() {
    if (this.isEditLoadingSignal()) return;
    if (!this.isEditModeSignal()) {
      this.editedPost.title = this.post!.title;
      this.editedPost.body = this.post!.body;
      this.isEditModeSignal.set(true);
    } else {
      this.isEditLoadingSignal.set(true);
      const newSlug = await this.postService.updatePost(
        this.post!.id,
        this.editedPost,
      );
      this.isEditLoadingSignal.set(false);
      this.isEditModeSignal.set(false);

      if (newSlug == null) this.hasEditErrorSignal.set(true);
      else this.transitionService.callNavigate('/posts/' + newSlug, true);
    }
  }

  onPostEditCancel() {
    if (!this.isEditLoadingSignal()) this.isEditModeSignal.set(false);
  }
}
