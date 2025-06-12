import { Injectable } from '@angular/core';
import { postTitleType, postType } from '../../types';
import { ApiService } from './api.service';

type postParamsType = {
  title: string;
  body: string;
  noOfImages: number;
  categoryId: string;
};

@Injectable({
  providedIn: 'root',
})
export class PostApiService extends ApiService {
  getPosts(categoryId: string) {
    return this.makeRequest(`/categories/${categoryId}/posts`);
  }

  getPostsAsync = this.asyncService.asAsync<postTitleType[]>(
    (categoryId: string) => this.getPosts(categoryId)
  );

  getPost(id: string) {
    return this.makeRequest(`/posts/${id}`);
  }

  getPostAsync = this.asyncService.asAsync<postType>((id: string) =>
    this.getPost(id)
  );

  createPost({ title, body, noOfImages, categoryId }: postParamsType) {
    return this.makeRequest(`/categories/${categoryId}/posts`, {
      method: 'POST',
      data: { title, body, images: noOfImages },
    });
  }

  createPostAsync = this.asyncService.asAsync((post: postParamsType) =>
    this.createPost(post)
  );

  deletePost(id: string) {
    return this.makeRequest(`/posts/${id}`, {
      method: 'DELETE',
    });
  }

  deletePostAsync = this.asyncService.asAsync((id: string) =>
    this.deletePost(id)
  );
}
