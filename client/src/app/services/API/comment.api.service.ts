import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

type commentParamsType = {
  id: string;
  postId: string;
  message: string;
  parentId?: string | null;
};

@Injectable({
  providedIn: 'root',
})
export class CommentApiService extends ApiService {
  createComment({ postId, message, parentId }: Omit<commentParamsType, 'id'>) {
    return this.makeRequest(`/posts/${postId}/comments`, {
      method: 'POST',
      data: { postId, message, parentId },
    });
  }

  createCommentAsync = this.asyncService.asAsync(
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

  updateCommentAsync = this.asyncService.asAsync(
    (comment: Omit<commentParamsType, 'parentId'>) =>
      this.updateComment(comment)
  );

  deleteComment(id: string) {
    return this.makeRequest(`/comments/${id}`, {
      method: 'DELETE',
    });
  }

  deleteCommentAsync = this.asyncService.asAsync((id: string) =>
    this.deleteComment(id)
  );

  toggleCommentLike(id: string) {
    return this.makeRequest(`/comments/${id}/toggleLike`, {
      method: 'POST',
    });
  }

  toggleCommentLikeAsync = this.asyncService.asAsync((id: string) =>
    this.toggleCommentLike(id)
  );
}
