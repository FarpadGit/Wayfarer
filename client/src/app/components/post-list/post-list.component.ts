import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';
import { PostListService } from '../../services/post-list.service';
import { TransitionService } from '../../services/transition.service';
import { AnimationService } from '../../services/animation.service';
import { LoaderComponent } from '../UI/loader/loader.component';
import { NewPostButtonComponent } from '../UI/new-post-button/new-post-button.component';
import { PostItemComponent } from '../post-item/post-item.component';
import { PaginatorComponent } from '../UI/paginator/paginator.component';
import { NgxPaginationModule } from 'ngx-pagination';

type animStates = 'none' | 'animating' | 'finished';

@Component({
  selector: 'app-post-list',
  standalone: true,
  imports: [
    CommonModule,
    NgxPaginationModule,
    LoaderComponent,
    NewPostButtonComponent,
    PostItemComponent,
    PaginatorComponent,
  ],
  templateUrl: './post-list.component.html',
  styleUrl: './post-list.component.scss',
})
export class PostListComponent implements OnInit {
  constructor(
    private apiService: ApiService,
    private postListService: PostListService,
    private transitionService: TransitionService,
    private animationService: AnimationService
  ) {}

  @ViewChild('paginator') paginator: PaginatorComponent | null = null;

  animationState: animStates = 'none';

  private hasLoaded = false;

  get loadingState() {
    if (this.postListService.loading) {
      if (this.hasLoaded) return 'reloading';
      else return 'loading';
    }
    if (this.postListService.error) return 'error';
    this.hasLoaded = true;
    return 'success';
  }
  get error() {
    return this.postListService.error;
  }
  get posts() {
    return this.postListService.posts;
  }

  ngOnInit(): void {
    this.postListService.refreshPosts();
  }

  startBgAnimation() {
    if (this.animationState === 'finished')
      this.animationService.startEnterAnimation();
  }

  onPostItemClicked(id: string) {
    this.transitionService.setNavigate(`/posts/${id}`);
    if (this.transitionService.firstTime) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      this.animationState = 'animating';
      this.transitionService.firstTime = false;
    } else {
      document.body.classList.add('blur');
      setTimeout(() => {
        this.transitionService.callNavigate();
      }, 500);
    }
  }

  deletePost(id: string) {
    this.apiService
      .deletePost(id)
      .then(() =>
        this.postListService
          .refreshPosts()
          .then(() => (this.paginator!.currentPage = 0))
      );
  }
}
