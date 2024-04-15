import { Injectable, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { postTitleType } from '../types';
import { AsyncService } from './async.service';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class PostListService implements OnDestroy {
  public loading = true;
  public error: unknown | null = null;
  public getPostsFn = this.AsyncService.asAsyncFn(() =>
    this.APIService.getPosts()
  );
  public posts: postTitleType[] = [];

  private loadingSub: Subscription | null = null;
  private errorSub: Subscription | null = null;

  constructor(
    private AsyncService: AsyncService,
    private APIService: ApiService
  ) {
    this.loadingSub = this.getPostsFn.loading.subscribe(
      (loading) => (this.loading = loading)
    );
    this.errorSub = this.getPostsFn.error.subscribe(
      (err) => (this.error = err)
    );
  }

  ngOnDestroy(): void {
    this.loadingSub?.unsubscribe();
    this.errorSub?.unsubscribe();
  }

  public async refreshPosts() {
    this.posts = (await this.getPostsFn.execute()) as postTitleType[];
  }

  createPost(title: string, body: string) {
    this.APIService.createPost({ title, body }).then(() => {
      this.refreshPosts();
    });
  }

  deletePost(id: string) {
    this.APIService.deletePost(id).then(() => {
      this.refreshPosts();
    });
  }
}
