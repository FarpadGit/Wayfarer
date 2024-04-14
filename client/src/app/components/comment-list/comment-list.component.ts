import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { commentType } from '../../types';
import { PostService } from '../../services/post.service';
import { CommentComponent } from '../comment/comment.component';

@Component({
  selector: 'app-comment-list',
  standalone: true,
  imports: [CommonModule, CommentComponent],
  templateUrl: './comment-list.component.html',
  styleUrl: './comment-list.component.scss',
})
export class CommentListComponent {
  @Input() comments: commentType[] = [];

  constructor(private postService: PostService) {}

  getChildComments(id: string) {
    return this.postService.getReplies(id) ?? [];
  }

  areChildrenHidden = false;
}
