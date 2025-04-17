import { Injectable } from '@angular/core';
import { categoryTitleType } from '../types';
import { userAccounts } from './login.service';
import { PostListService } from './post-list.service';
import { CategoryApiService } from './API/category.api.service';

@Injectable({
  providedIn: 'root',
})
export class CategoryListService {
  constructor(
    private apiService: CategoryApiService,
    private postListService: PostListService
  ) {}

  private getCategoriesFn = this.apiService.getCategoriesAsync;

  get loading() {
    return this.getCategoriesFn.loading();
  }
  get error() {
    return this.getCategoriesFn.error();
  }
  get allCategories() {
    return this.getCategoriesFn.value() ?? [];
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
    await this.getCategoriesFn
      .execute()
      .then((categories) => this.replaceCreatorNames(categories));
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
