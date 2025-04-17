import { Injectable } from '@angular/core';
import { postTitleType } from '../types';
import { userAccounts } from './login.service';
import { PostApiService } from './API/post.api.service';

@Injectable({
  providedIn: 'root',
})
export class PostListService {
  constructor(private apiService: PostApiService) {}

  private getPostsFn = this.apiService.getPostsAsync;

  get reloading() {
    return this.getPostsFn.loading();
  }
  get error() {
    return this.getPostsFn.error();
  }
  get posts() {
    return this.getPostsFn.value() ?? [];
  }

  private currentCategoryId: string = '';
  getCurrentCategory() {
    return this.currentCategoryId;
  }

  async getPostsByCategory(categoryId: string) {
    await this.getPostsFn.execute(categoryId).then((posts) => {
      this.currentCategoryId = categoryId;
      posts.sort(
        (post1, post2) =>
          new Date(post2.createdAt).valueOf() -
          new Date(post1.createdAt).valueOf()
      );
      return this.replaceAuthorNames(posts);
    });
  }

  private refreshPosts() {
    this.getPostsByCategory(this.currentCategoryId);
  }

  private replaceAuthorNames(posts: postTitleType[]) {
    posts.forEach((post) => {
      if (post.uploader.email === userAccounts.ADMIN.email)
        post.uploader.name = userAccounts.ADMIN.display;
      if (post.uploader.email === userAccounts.GUEST.email)
        post.uploader.name = userAccounts.GUEST.display;
    });
    return posts;
  }

  createPost(title: string, body: string, categoryId: string) {
    this.apiService.createPost({ title, body, categoryId }).then(() => {
      this.refreshPosts();
    });
  }

  deletePost(id: string) {
    this.apiService.deletePost(id).then(() => {
      this.refreshPosts();
    });
  }
}
