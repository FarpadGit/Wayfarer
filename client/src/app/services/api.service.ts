import { Injectable } from '@angular/core';
import { AsyncService } from './async.service';
import axios, { AxiosRequestConfig } from 'axios';
import { postTitleType, postType, categoryTitleType } from '../types';

type postParamsType = { title: string; body: string; categoryId: string };
type commentParamsType = {
  id: string;
  postId: string;
  message: string;
  parentId?: string | null;
};

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private asyncService: AsyncService) {}

  private callAxios = axios.create({
    baseURL: import.meta.env['NG_APP_SERVER_URL'],
    withCredentials: true,
  });

  private async makeRequest(url: string, options?: AxiosRequestConfig<any>) {
    return this.callAxios(url, options)
      .then((res) => res.data)
      .catch((error) =>
        Promise.reject(
          error?.response?.data?.message ??
            'Sajnos egy ismeretlen eredetű hiba lépett fel a szerverhez kapcsolódás közben.'
        )
      );
  }

  validateUser(user: { email: string; display: string }) {
    return this.makeRequest('/login', {
      method: 'POST',
      data: {
        userToken: {
          email: user.email,
          name: user.display,
        },
      },
    });
  }

  getCategories() {
    return this.makeRequest('/categories');
  }

  getCategoriesAsync = this.asyncService.asAsyncFn<categoryTitleType[]>(() =>
    this.getCategories()
  );

  createCategory(title: string) {
    return this.makeRequest('/categories', {
      method: 'POST',
      data: { title },
    });
  }

  createCategoryAsync = this.asyncService.asAsyncFn((title: string) =>
    this.createCategory(title)
  );

  deleteCategory(id: string) {
    return this.makeRequest(`/categories/${id}`, {
      method: 'DELETE',
    });
  }

  deleteCategoryAsync = this.asyncService.asAsyncFn((id: string) =>
    this.deleteCategory(id)
  );

  getPosts(categoryId: string) {
    return this.makeRequest(`/categories/${categoryId}/posts`);
  }

  getPostsAsync = this.asyncService.asAsyncFn<postTitleType[]>(
    (categoryId: string) => this.getPosts(categoryId)
  );

  getPost(id: string) {
    return this.makeRequest(`/posts/${id}`);
  }

  getPostAsync = this.asyncService.asAsyncFn<postType>((id: string) =>
    this.getPost(id)
  );

  createPost({ title, body, categoryId }: postParamsType) {
    return this.makeRequest(`/categories/${categoryId}/posts`, {
      method: 'POST',
      data: { title, body },
    });
  }

  createPostAsync = this.asyncService.asAsyncFn((post: postParamsType) =>
    this.createPost(post)
  );

  deletePost(id: string) {
    return this.makeRequest(`/posts/${id}`, {
      method: 'DELETE',
    });
  }

  deletePostAsync = this.asyncService.asAsyncFn((id: string) =>
    this.deletePost(id)
  );

  createComment({ postId, message, parentId }: Omit<commentParamsType, 'id'>) {
    return this.makeRequest(`/posts/${postId}/comments`, {
      method: 'POST',
      data: { postId, message, parentId },
    });
  }

  createCommentAsync = this.asyncService.asAsyncFn(
    (comment: Omit<commentParamsType, 'id'>) => this.createComment(comment)
  );

  updateComment({
    message,
    id,
  }: Omit<commentParamsType, 'parentId' | 'postId'>) {
    return this.makeRequest(`/comments/${id}`, {
      method: 'PUT',
      data: { message },
    });
  }

  updateCommentAsync = this.asyncService.asAsyncFn(
    (comment: Omit<commentParamsType, 'parentId'>) =>
      this.updateComment(comment)
  );

  deleteComment(id: string) {
    return this.makeRequest(`/comments/${id}`, {
      method: 'DELETE',
    });
  }

  deleteCommentAsync = this.asyncService.asAsyncFn((id: string) =>
    this.deleteComment(id)
  );

  toggleCommentLike(id: string) {
    return this.makeRequest(`/comments/${id}/toggleLike`, {
      method: 'POST',
    });
  }

  toggleCommentLikeAsync = this.asyncService.asAsyncFn((id: string) =>
    this.toggleCommentLike(id)
  );
}
