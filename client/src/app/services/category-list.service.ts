import { Injectable } from '@angular/core';
import { categoryTitleType } from '../types';
import { ApiService } from './api.service';
import { userAccounts } from './login.service';
import { PostListService } from './post-list.service';

@Injectable({
  providedIn: 'root',
})
export class CategoryListService {
  constructor(
    private apiService: ApiService,
    private postListService: PostListService
  ) {}

  private getCategories = () =>
    this.apiService.getCategoriesAsync
      .execute()
      .then((categories) => this.replaceCreatorNames(categories));
  get loading() {
    return this.apiService.getCategoriesAsync.loading();
  }
  get error() {
    return this.apiService.getCategoriesAsync.error();
  }
  get allCategories() {
    return this.apiService.getCategoriesAsync.value() ?? [];
  }

  getCurrentCategory() {
    return this.postListService.getCurrentCategory();
  }

  setCurrentCategory(id: string) {
    this.postListService.getPostsByCategory(id);
  }

  async selectFirstCategory() {
    await this.postListService.getPostsByCategory(this.allCategories[0].id);
  }

  async refreshCategories() {
    await this.getCategories();
  }

  private replaceCreatorNames(categories: categoryTitleType[]) {
    categories.forEach((category) => {
      if (category.creator.email === userAccounts.ADMIN.email)
        category.creator.name = userAccounts.ADMIN.display;
      if (category.creator.email === userAccounts.GUEST.email)
        category.creator.name = userAccounts.GUEST.display;
    });
    return categories;
  }

  createCategory(title: string) {
    this.apiService.createCategory(title).then(() => {
      this.refreshCategories();
    });
  }

  deleteCategory(id: string) {
    this.apiService.deleteCategory(id).then(() => {
      this.refreshCategories();
    });
  }
}
