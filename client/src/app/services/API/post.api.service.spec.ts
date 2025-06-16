import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';

import { PostApiService } from './post.api.service';
import { AsyncService } from './async.service';
import { mockCategory, mockPost, mockPostTitle } from '../../../test/mocks';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

describe('PostApiService', () => {
  let service: PostApiService;
  let asyncSpy: jasmine.SpyObj<AsyncService>;
  let mockAxios: MockAdapter;

  beforeAll(() => {
    mockAxios = new MockAdapter(axios);
  });

  beforeEach(() => {
    mockAxios
      .onGet(`/categories/${mockCategory.id}/posts`)
      .reply(200, [mockPostTitle, mockPostTitle])
      .onGet(`/posts/${mockPostTitle.id}`)
      .reply(200, mockPost)
      .onPost(`/categories/${mockCategory.id}/posts`, {
        asymmetricMatch: () => ({
          title: jasmine.any(String),
          body: jasmine.any(String),
        }),
      })
      .reply(200, 'create endpoint called')
      .onDelete(`/posts/${mockPostTitle.id}`)
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

    service = TestBed.inject(PostApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all posts under a category', async () => {
    const response = await service.getPosts(mockCategory.id);

    expect(response).toEqual([mockPostTitle, mockPostTitle]);
  });

  it('should return an object with utilities to get all posts asynchronously', async () => {
    const response = service.getPostsAsync;

    expect(asyncSpy.asAsync).toHaveBeenCalled();
    expect(response).toEqual({
      loading: jasmine.any(Function),
      error: jasmine.any(Function),
      value: jasmine.any(Function),
      execute: jasmine.any(Function),
    });
  });

  it('should get post', async () => {
    const response = await service.getPost(mockPostTitle.id);

    expect(response).toEqual(mockPost);
  });

  it('should return an object with utilities to get post asynchronously', async () => {
    const response = service.getPostAsync;

    expect(asyncSpy.asAsync).toHaveBeenCalled();
    expect(response).toEqual({
      loading: jasmine.any(Function),
      error: jasmine.any(Function),
      value: jasmine.any(Function),
      execute: jasmine.any(Function),
    });
  });

  it('should create new post', async () => {
    const response = await service.createPost({
      title: 'Fake New Post Title',
      body: 'Lorem Ipsum Dolor Sit Amet',
      noOfImages: 0,
      categoryId: mockCategory.id,
    });

    expect(response).toEqual('create endpoint called');
  });

  it('should return an object with utilities to create new post asynchronously', async () => {
    const response = service.createPostAsync;

    expect(asyncSpy.asAsync).toHaveBeenCalled();
    expect(response).toEqual({
      loading: jasmine.any(Function),
      error: jasmine.any(Function),
      value: jasmine.any(Function),
      execute: jasmine.any(Function),
    });
  });

  it('should delete existing post', async () => {
    const response = await service.deletePost(mockPostTitle.id);

    expect(response).toBe('delete endpoint called');
  });

  it('should return an object with utilities to delete existing post asynchronously', async () => {
    const response = service.deletePostAsync;

    expect(asyncSpy.asAsync).toHaveBeenCalled();
    expect(response).toEqual({
      loading: jasmine.any(Function),
      error: jasmine.any(Function),
      value: jasmine.any(Function),
      execute: jasmine.any(Function),
    });
  });
});
