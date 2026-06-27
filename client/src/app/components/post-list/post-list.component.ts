import { Component, ElementRef, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostListService } from '../../services/post-list.service';
import { TransitionService } from '../../services/transition.service';
import { AnimationService } from '../../services/animation.service';
import { NewPostButtonComponent } from '../UI/new-post-button/new-post-button.component';
import { PostItemComponent } from './post-item/post-item.component';
import { PaginatorComponent } from '../UI/paginator/paginator.component';
import { NgxPaginationModule } from 'ngx-pagination';

enum animStates {
  none = 'none',
  animating = 'animating',
  finished = 'finished',
}

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
  styleUrls: ['./post-list.component.scss', './animations.scss'],
})
export class PostListComponent {
  constructor(
    private postListService: PostListService,
    private transitionService: TransitionService,
    private animationService: AnimationService,
    private el: ElementRef,
  ) {}

  @ViewChild('paginator') paginator: PaginatorComponent | null = null;

  animationState = signal(animStates.none);
  hasHighlighted = false;
  private postsUnderDeletion: string[] = [];

  get animationStateClass() {
    const filter = [animStates.animating, animStates.finished];
    const state = this.animationState();
    return filter.includes(state) ? state : '';
  }

  get animStates() {
    return animStates;
  }

  get reloading() {
    return this.postListService.reloading();
  }
  get error() {
    return this.postListService.error();
  }
  get posts() {
    return this.postListService.posts();
  }
  isPostDeleting(postId: string) {
    return this.postsUnderDeletion.includes(postId);
  }

  handleHighlightChanged(isAnimating: boolean) {
    if (isAnimating) this.hasHighlighted = true;
    else
      this.hasHighlighted =
        this.el.nativeElement.querySelectorAll('.highlighted').length > 0;
  }

  startEnterAnimation() {
    if (this.animationState() === animStates.finished)
      this.animationService.startEnterAnimation();
  }

  onPostItemClicked(slug: string) {
    this.transitionService.setNavigate(`/posts/${slug}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (this.transitionService.firstTime) {
      this.animationService.startCollapseAnimation();
      this.animationState.set(animStates.animating);
      this.transitionService.firstTime = false;
    } else {
      this.animationService.startQuickEnterAnimation();
      this.transitionService.callDelayedNavigate(1000);
    }
  }

  deletePost(id: string) {
    this.postsUnderDeletion.push(id);
    this.postListService.deletePost(id);
    this.paginator!.currentPage = 0;
  }
}
