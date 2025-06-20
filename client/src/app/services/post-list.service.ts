import { Injectable } from '@angular/core';
import { postTitleType, postType } from '../types';
import { userAccounts } from './login.service';
import { PostApiService } from './API/post.api.service';
import { ImagesApiService } from './API/images.api.service';

@Injectable({
  providedIn: 'root',
})
export class PostListService {
  constructor(
    private postApiService: PostApiService,
    private imagesApiService: ImagesApiService
  ) {}

  private getPostsFn = this.postApiService.getPostsAsync;

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

  async createPost(
    title: string,
    body: string,
    files: File[],
    categoryId: string
  ) {
    const postId = await this.postApiService.createPost({
      title,
      body,
      noOfImages: files.length,
      categoryId,
    });
    if (files.length > 0) {
      this.imagesApiService.uploadImages(
        files,
        postId,
        this.postApiService.userId
      );
    }
    this.refreshPosts();
  }

  deletePost(id: string) {
    this.postApiService.deletePost(id).then(() => {
      this.refreshPosts();
    });
  }
}
