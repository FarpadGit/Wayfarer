import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';

import { CategoryApiService } from './category.api.service';
import { AsyncService } from './async.service';
import { mockCategory } from '../../../test/mocks';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

describe('CategoryApiService', () => {
  let service: CategoryApiService;
  let asyncSpy: jasmine.SpyObj<AsyncService>;
  let mockAxios: MockAdapter;

  beforeAll(() => {
    mockAxios = new MockAdapter(axios);
  });

  beforeEach(() => {
    mockAxios
      .onGet('/categories')
      .reply(200, [mockCategory, mockCategory])
      .onPost('/categories', {
        asymmetricMatch: () => ({ title: jasmine.any(String) }),
      })
      .reply(201, 'create endpoint called')
      .onDelete(`/categories/${mockCategory.id}`)
      .reply(204, 'delete endpoint called');

    asyncSpy = jasmine.createSpyObj('AsyncService', ['asAsync']);
    asyncSpy.asAsync.and.returnValue({
      loading: signal(true),
      error: signal(null),
      value: signal([]),
      execute: () => Promise.resolve(null),
    });

    TestBed.configureTestingModule({
      providers: [{ provide: AsyncService, useValue: asyncSpy }],
    });

    service = TestBed.inject(CategoryApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all categories', async () => {
    const response = await service.getCategories();

    expect(response).toEqual([mockCategory, mockCategory]);
  });

  it('should return an object with utilities to get all categories asynchronously', async () => {
    const response = service.getCategoriesAsync;

    expect(asyncSpy.asAsync).toHaveBeenCalled();
    expect(response).toEqual({
      loading: jasmine.any(Function),
      error: jasmine.any(Function),
      value: jasmine.any(Function),
      execute: jasmine.any(Function),
    });
  });

  it('should create new category', async () => {
    const response = await service.createCategory('Fake New Category Title');

    expect(response).toBe('create endpoint called');
  });

  it('should return an object with utilities to create new category asynchronously', async () => {
    const response = service.createCategoryAsync;

    expect(asyncSpy.asAsync).toHaveBeenCalled();
    expect(response).toEqual({
      loading: jasmine.any(Function),
      error: jasmine.any(Function),
      value: jasmine.any(Function),
      execute: jasmine.any(Function),
    });
  });

  it('should delete existing category', async () => {
    const response = await service.deleteCategory(mockCategory.id);

    expect(response).toBe('delete endpoint called');
  });

  it('should return an object with utilities to delete existing category asynchronously', async () => {
    const response = service.deleteCategoryAsync;

    expect(asyncSpy.asAsync).toHaveBeenCalled();
    expect(response).toEqual({
      loading: jasmine.any(Function),
      error: jasmine.any(Function),
      value: jasmine.any(Function),
      execute: jasmine.any(Function),
    });
  });
});
