import { Component, OnInit } from '@angular/core';
import { PostListComponent } from '../post-list/post-list.component';
import { CategoryListComponent } from '../category-list/category-list.component';
import { PostListService } from '../../services/post-list.service';
import { CategoryListService } from '../../services/category-list.service';
import { LoaderComponent } from '../UI/loader/loader.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CategoryListComponent, PostListComponent, LoaderComponent],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
})
export class LandingComponent implements OnInit {
  constructor(
    private categoryListService: CategoryListService,
    private postListService: PostListService
  ) {}

  loaded = false;

  get loadingState() {
    if (this.categoryListService.error || this.postListService.error)
      return 'error';
    else if (!this.loaded) return 'loading';
    return 'success';
  }
  get error() {
    return this.categoryListService.error ?? this.postListService.error;
  }

  ngOnInit(): void {
    this.categoryListService
      .refreshCategories()
      .then(() => this.categoryListService.selectFirstCategory())
      .then(() => (this.loaded = true));
  }
}
