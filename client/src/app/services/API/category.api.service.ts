import { Injectable } from '@angular/core';
import { categoryTitleType } from '../../types';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class CategoryApiService extends ApiService {
  getCategories() {
    return this.makeRequest('/categories');
  }

  getCategoriesAsync = this.asyncService.asAsync<categoryTitleType[]>(() =>
    this.getCategories()
  );

  createCategory(title: string) {
    return this.makeRequest('/categories', {
      method: 'POST',
      data: { title },
    });
  }

  createCategoryAsync = this.asyncService.asAsync((title: string) =>
    this.createCategory(title)
  );

  deleteCategory(id: string) {
    return this.makeRequest(`/categories/${id}`, {
      method: 'DELETE',
    });
  }

  deleteCategoryAsync = this.asyncService.asAsync((id: string) =>
    this.deleteCategory(id)
  );
}
