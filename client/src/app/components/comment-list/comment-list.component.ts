import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { commentType } from '../../types';
import { PostService } from '../../services/post.service';
import { CommentComponent } from '../comment/comment.component';
import { animate, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-comment-list',
  standalone: true,
  imports: [CommonModule, CommentComponent],
  templateUrl: './comment-list.component.html',
  styleUrl: './comment-list.component.scss',
  animations: [
    trigger('fade-in-out', [
      transition(':enter', [
        style({ translate: '0 -20%', opacity: 0 }),
        animate('0.25s ease', style({ translate: '0 0%', opacity: 1 })),
      ]),
      transition(':leave', [
        animate('0.25s ease', style({ translate: '0 -20%', opacity: 0 })),
      ]),
    ]),
  ],
})
export class CommentListComponent {
  @Input() comments: commentType[] = [];

  constructor(private postService: PostService) {}

  getChildComments(id: string) {
    return this.postService.getReplies(id) ?? [];
  }

  areChildrenHidden = false;
}
