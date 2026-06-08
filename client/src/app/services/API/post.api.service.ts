import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

type newPostParamsType = {
  title: string;
  body: string;
  noOfImages: number;
  categoryId: string;
};
type editPostParamsType = {
  postId: string;
  title?: string;
  body?: string;
};

@Injectable({
  providedIn: 'root',
})
export class PostApiService extends ApiService {
  getPosts(categoryId: string) {
    return this.makeRequest(`/categories/${categoryId}/posts`);
  }

  getPostsAsync = this.asyncService.asAsync<postTitleType[]>(
    (categoryId: string) => this.getPosts(categoryId),
  );

  getPost(slug: string) {
    return this.makeRequest(`/posts/${slug}`);
  }

  getPostAsync = this.asyncService.asAsync<postType>((slug: string) =>
    this.getPost(slug),
  );

  createPost({ title, body, noOfImages, categoryId }: newPostParamsType) {
    return this.makeRequest(`/categories/${categoryId}/posts`, {
      method: 'POST',
      data: { title, body, images: noOfImages },
    });
  }

  createPostAsync = this.asyncService.asAsync((post: newPostParamsType) =>
    this.createPost(post),
  );

  updatePost({ title, body, postId }: editPostParamsType) {
    return this.makeRequest(`/posts/${postId}`, {
      method: 'PATCH',
      data: { title, body, images: [] },
    });
  }

  updatePostAsync = this.asyncService.asAsync((post: editPostParamsType) =>
    this.updatePost(post),
  );

  deletePost(id: string) {
    return this.makeRequest(`/posts/${id}`, {
      method: 'DELETE',
    });
  }

  deletePostAsync = this.asyncService.asAsync((id: string) =>
    this.deletePost(id),
  );
}
