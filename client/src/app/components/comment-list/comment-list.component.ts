import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostService } from '../../services/post.service';
import { CommentComponent } from '../comment/comment.component';

@Component({
  selector: 'app-comment-list',
  standalone: true,
  imports: [CommonModule, CommentComponent],
  templateUrl: './comment-list.component.html',
  styleUrl: './comment-list.component.scss',
})
export class CommentListComponent implements OnInit {
  @Input() comments: commentType[] = [];
  areChildrenHidden: boolean[] = [];

  constructor(private postService: PostService) {}

  ngOnInit(): void {
    this.areChildrenHidden = this.comments.map(() => false);
  }

  getChildComments(id: string) {
    return this.postService.getReplies(id) ?? [];
  }
}
