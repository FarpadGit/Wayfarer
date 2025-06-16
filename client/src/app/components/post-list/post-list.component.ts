import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostListService } from '../../services/post-list.service';
import { TransitionService } from '../../services/transition.service';
import { AnimationService } from '../../services/animation.service';
import { NewPostButtonComponent } from '../UI/new-post-button/new-post-button.component';
import { PostItemComponent } from './post-item/post-item.component';
import { PaginatorComponent } from '../UI/paginator/paginator.component';
import { NgxPaginationModule } from 'ngx-pagination';
import {
  collapseAnimations,
  emptyListLabelAnimations,
  listAnimations,
  listItemAnimations,
  animStates,
} from './animations';

@Component({
  selector: 'app-post-list',
  standalone: true,
  imports: [
    CommonModule,
    NgxPaginationModule,
    NewPostButtonComponent,
    PostItemComponent,
    PaginatorComponent,
  ],
  templateUrl: './post-list.component.html',
  styleUrl: './post-list.component.scss',
  animations: [
    listAnimations,
    listItemAnimations,
    emptyListLabelAnimations,
    collapseAnimations,
  ],
})
export class PostListComponent {
  constructor(
    private postListService: PostListService,
    private transitionService: TransitionService,
    private animationService: AnimationService
  ) {}

  @ViewChild('paginator') paginator: PaginatorComponent | null = null;

  animationState: animStates = animStates.none;
  isListClipped: boolean = true;
  private timeoutToken?: ReturnType<typeof setTimeout>;

  get animStates() {
    return animStates;
  }

  get reloading() {
    return this.postListService.reloading;
  }
  get error() {
    return this.postListService.error;
  }
  get posts() {
    return this.postListService.posts;
  }
  isPostDeleting(postId: string) {
    return this.postUnderDeletion.includes(postId);
  }

  postUnderDeletion: string[] = [];

  onHightlightChanged(highlighted: boolean) {
    clearTimeout(this.timeoutToken);
    if (highlighted) this.isListClipped = false;
    else
      this.timeoutToken = setTimeout(() => {
        this.isListClipped = true;
      }, PostItemComponent.highlightAnimationDuration);
  }

  startEnterAnimation() {
    if (this.animationState === animStates.finished)
      this.animationService.startEnterAnimation();
  }

  onPostItemClicked(id: string) {
    this.transitionService.setNavigate(`/posts/${id}`);
    if (this.transitionService.firstTime) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      this.animationService.startCollapseAnimation();
      this.animationState = animStates.animating;
      this.transitionService.firstTime = false;
    } else {
      this.transitionService.blur = true;
      this.transitionService.callDelayedNavigate(500);
    }
  }

  deletePost(id: string) {
    this.postUnderDeletion.push(id);
    this.postListService.deletePost(id);
    this.paginator!.currentPage = 0;
  }
}
