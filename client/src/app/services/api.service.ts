import { Injectable } from '@angular/core';
import axios, { AxiosRequestConfig } from 'axios';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private callAxios = axios.create({
    baseURL: import.meta.env['NG_APP_SERVER_URL'],
    withCredentials: true,
  });

  private async makeRequest(url: string, options?: AxiosRequestConfig<any>) {
    return this.callAxios(url, options)
      .then((res) => {
        sessionStorage.setItem('userId', res.headers['userid']);
        return res.data;
      })
      .catch((error) =>
        Promise.reject(
          error?.response?.data?.message ??
            'Sajnos egy ismeretlen hiba lépett fel'
        )
      );
  }

  public validateUser(user: string) {
    return this.makeRequest('/login', {
      method: 'POST',
      data: { userToken: user },
    });
  }

  public getPosts() {
    return this.makeRequest('/posts');
  }

  public getPost(id: string) {
    return this.makeRequest(`/posts/${id}`);
  }

  public createPost({ title, body }: { title: string; body: string }) {
    return this.makeRequest('/posts', {
      method: 'POST',
      data: { title, body },
    });
  }

  public deletePost(id: string) {
    return this.makeRequest(`/posts/${id}`, {
      method: 'DELETE',
    });
  }

  public createComment({
    postId,
    message,
    parentId,
  }: {
    postId: string;
    message: string;
    parentId: string;
  }) {
    return this.makeRequest(`posts/${postId}/comments`, {
      method: 'POST',
      data: { id: postId, message, parentId },
    });
  }

  public updateComment({
    postId,
    message,
    id,
  }: {
    postId: string;
    message: string;
    id: string;
  }) {
    return this.makeRequest(`posts/${postId}/comments/${id}`, {
      method: 'PUT',
      data: { message },
    });
  }

  public deleteComment({ postId, id }: { postId: string; id: string }) {
    return this.makeRequest(`posts/${postId}/comments/${id}`, {
      method: 'DELETE',
    });
  }

  public toggleCommentLike({ id, postId }: { id: string; postId: string }) {
    return this.makeRequest(`/posts/${postId}/comments/${id}/toggleLike`, {
      method: 'POST',
      data: { body: '' },
    });
  }
}
