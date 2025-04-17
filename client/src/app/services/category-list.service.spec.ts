import { TestBed } from '@angular/core/testing';

import { CategoryListService } from './category-list.service';
import { CategoryApiService } from './API/category.api.service';
import { PostListService } from './post-list.service';
import { mockCategory } from '../../test/mocks';

describe('CategoryListService', () => {
  let service: CategoryListService;
  let categoryApiSpy: jasmine.SpyObj<CategoryApiService>;
  let postListSpy: jasmine.SpyObj<PostListService>;
  let executeSpy: jasmine.Spy;
  const mockCategories = [{ ...mockCategory, id: 'FirstItemID' }, mockCategory];

  beforeEach(() => {
    categoryApiSpy = jasmine.createSpyObj(
      'CategoryApiService',
      ['createCategory', 'deleteCategory'],
      {
        getCategoriesAsync: {
          loading: () => false,
          error: () => null,
          value: () => mockCategories,
          execute: () => Promise.resolve(mockCategories),
        },
      }
    );
    postListSpy = jasmine.createSpyObj('PostListService', [
      'getCurrentCategory',
      'getPostsByCategory',
      'getPostsByCategory',
    ]);

    categoryApiSpy.createCategory.and.resolveTo();
    categoryApiSpy.deleteCategory.and.resolveTo();
    executeSpy = spyOn(categoryApiSpy.getCategoriesAsync, 'execute');
    executeSpy.and.callThrough();

    TestBed.configureTestingModule({
      providers: [
        { provide: CategoryApiService, useValue: categoryApiSpy },
        { provide: PostListService, useValue: postListSpy },
      ],
    });

    service = TestBed.inject(CategoryListService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return loading signal value', () => {
    expect(service.loading).toBe(categoryApiSpy.getCategoriesAsync.loading());
  });

  it('should return error signal value', () => {
    expect(service.error).toBe(categoryApiSpy.getCategoriesAsync.error());
  });

  it('should return value signal value', () => {
    expect(service.allCategories).toEqual(
      categoryApiSpy.getCategoriesAsync.value()!
    );
  });

  it('should return current active category', () => {
    service.getCurrentCategory();

    expect(postListSpy.getCurrentCategory).toHaveBeenCalled();
  });

  it('should set current active category', () => {
    const testID = 'FakeCategoryID';
    service.setCurrentCategory(testID);

    expect(postListSpy.getPostsByCategory).toHaveBeenCalledWith(testID);
  });

  it('should set first category as active', async () => {
    const firstCategory = categoryApiSpy.getCategoriesAsync.value()![0];
    await service.selectFirstCategory();

    expect(postListSpy.getPostsByCategory).toHaveBeenCalledWith(
      firstCategory.id
    );
  });

  it('should refresh categories by calling the server again', async () => {
    await service.refreshCategories();

    expect(executeSpy).toHaveBeenCalled();
  });

  it('should create new category and refetch all categories', (done) => {
    const testTitle = 'Fake New Category';
    service.createCategory(testTitle);

    setTimeout(() => {
      expect(categoryApiSpy.createCategory).toHaveBeenCalledWith(testTitle);
      expect(executeSpy).toHaveBeenCalled();
      done();
    }, 0);
  });

  it('should delete category and refetch all categories', (done) => {
    service.deleteCategory(mockCategory.id);

    setTimeout(() => {
      expect(categoryApiSpy.deleteCategory).toHaveBeenCalledWith(
        mockCategory.id
      );
      expect(executeSpy).toHaveBeenCalled();
      done();
    }, 0);
  });
});
