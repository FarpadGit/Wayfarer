import { computed, Injectable, OnDestroy, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { commentType } from '../types';
import { ApiService } from './api.service';
import { LoginService, userAccounts } from './login.service';

@Injectable({
  providedIn: 'root',
})
export class PostService implements OnDestroy {
  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private loginService: LoginService
  ) {
    this.routeSub = this.route.params.subscribe((params) => {
      if (params['id'] && this.id !== params['id']) {
        this.id = params['id'];
        this.getPost(this.id);
      }
    });
  }

  id = '';

  private getPost = (id: string) =>
    this.apiService.getPostAsync.execute(id).then((post) => {
      post.comments = this.replaceAuthorNames(post.comments || []);
      this.localComments.set(post.comments);
      return post;
    });
  get loading() {
    return this.apiService.getPostAsync.loading();
  }
  get error() {
    return this.apiService.getPostAsync.error();
  }
  get post() {
    return this.apiService.getPostAsync.value();
  }
  localComments = signal<commentType[]>([]);

  private routeSub: Subscription | null = null;

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }

  private replaceAuthorNames(comments: commentType[]) {
    comments.forEach((comment) => {
      if (comment.user.email === userAccounts.ADMIN.email)
        comment.user.name = userAccounts.ADMIN.display;
      if (comment.user.email === userAccounts.GUEST.email)
        comment.user.name = userAccounts.GUEST.display;
    });
    return comments;
  }

  private commentsByParentId = computed(() => {
    const group: { [key: string]: commentType[] } = {};
    this.localComments().forEach((comment) => {
      const index = comment.parentId ?? 'null';
      group[index] ||= [];
      group[index].push(comment);
    });
    return group;
  });

  get rootComments() {
    return this.commentsByParentId()['null'];
  }

  getReplies(parentId: string) {
    return this.commentsByParentId()[parentId];
  }

  createComment(message: string, parentId: string | null = null) {
    const newComment = this.createLocalComment(message, parentId);
    this.apiService
      .createComment({ postId: this.id, message, parentId })
      .then((id: string) => (newComment.id = id));
  }

  updateComment(id: string, message: string) {
    this.updateLocalComment(id, message);
    this.apiService.updateComment({ message, id });
  }

  deleteComment(id: string) {
    this.deleteLocalComment(id);
    this.apiService.deleteComment(id);
  }

  toggleCommentLike(id: string, addLike: boolean) {
    this.toggleLocalCommentLike(id, addLike);
    this.apiService.toggleCommentLike(id);
  }

  private createLocalComment(message: string, parentId: string | null) {
    const localComment: commentType = {
      id: '#temp#',
      isLikedByMe: false,
      likeCount: 0,
      createdAt: new Date(Date.now()).toISOString(),
      message,
      parentId,
      user: {
        email: this.loginService.currentUserEmail,
        name: this.loginService.currentUserName,
      },
    };

    this.localComments.update((prev) => [localComment, ...prev]);

    return localComment;
  }

  private updateLocalComment(id: string, message: string) {
    this.localComments.update((prev) =>
      prev.map((comment) => {
        if (comment.id === id) return { ...comment, message };
        else return comment;
      })
    );
  }

  private deleteLocalComment(id: string) {
    this.localComments.update((prev) =>
      prev.filter((comment) => comment.id !== id)
    );
  }

  private toggleLocalCommentLike(id: string, addLike: boolean) {
    this.localComments.update((prev) =>
      prev.map((comment) => {
        if (id !== comment.id) return comment;
        return {
          ...comment,
          likeCount: comment.likeCount + (addLike ? 1 : -1),
          isLikedByMe: addLike == true,
        };
      })
    );
  }
}
