import { Injectable, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { commentType, postType } from '../types';
import { AsyncService } from './async.service';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class PostService implements OnDestroy {
  id = '';
  loading = true;
  error: unknown | null = null;
  post: postType | null = null;
  comments: commentType[] = [];

  private routeSub: Subscription | null = null;

  private loadingSub: Subscription | null = null;
  private errorSub: Subscription | null = null;
  private postSub: Subscription | null = null;

  constructor(
    private route: ActivatedRoute,
    private AsyncService: AsyncService,
    private APIService: ApiService
  ) {
    this.routeSub = this.route.params.subscribe((params) => {
      this.id = params['id'];
    });

    const {
      loading,
      error,
      value: post,
    } = this.AsyncService.asAsync<postType>(() =>
      this.APIService.getPost(this.id)
    );
    this.loadingSub = loading.subscribe((loading) => (this.loading = loading));
    this.errorSub = error.subscribe((err) => (this.error = err));
    this.postSub = post.subscribe((post) => {
      this.post = post;
      this.comments = post?.comments || [];
    });
  }

  ngOnDestroy(): void {
    this.loadingSub?.unsubscribe();
    this.errorSub?.unsubscribe();
    this.postSub?.unsubscribe();
    this.routeSub?.unsubscribe();
  }

  get commentsByParentId() {
    const group: { [key: string]: commentType[] } = {};
    this.comments.forEach((comment) => {
      const index = comment.parentId ?? 'null';
      group[index] ||= [];
      group[index].push(comment);
    });
    return group;
  }

  get rootComments() {
    return this.commentsByParentId['null'];
  }

  getReplies(parentId: string) {
    return this.commentsByParentId[parentId];
  }

  createLocalComment(comment: commentType) {
    this.comments = [comment, ...this.comments];
  }

  updateLocalComment(id: string, message: string) {
    this.comments = this.comments.map((comment) => {
      if (comment.id === id) {
        return { ...comment, message };
      } else {
        return comment;
      }
    });
  }

  deleteLocalComment(id: string) {
    this.comments = this.comments.filter((comment) => comment.id !== id);
  }

  toggleLocalCommentLike(id: string, addLike: boolean) {
    this.comments = this.comments.map((comment) => {
      if (id === comment.id) {
        if (addLike) {
          return {
            ...comment,
            likeCount: comment.likeCount + 1,
            isLikedByMe: true,
          };
        } else {
          return {
            ...comment,
            likeCount: comment.likeCount - 1,
            isLikedByMe: false,
          };
        }
      } else {
        return comment;
      }
    });
  }
}
