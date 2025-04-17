import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';

import { CommentApiService } from './comment.api.service';
import { AsyncService } from './async.service';
import { mockComment, mockPostTitle } from '../../../test/mocks';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

describe('CommentApiService', () => {
  let service: CommentApiService;
  let asyncSpy: jasmine.SpyObj<AsyncService>;
  let mockAxios: MockAdapter;

  beforeAll(() => {
    mockAxios = new MockAdapter(axios);
  });

  beforeEach(() => {
    mockAxios
      .onPost(`/posts/${mockPostTitle.id}/comments`, {
        asymmetricMatch: () => ({
          postId: jasmine.any(String),
          message: jasmine.any(String),
          parentId: jasmine.any(String),
        }),
      })
      .reply(200, 'create endpoint called')
      .onPut(`/comments/${mockComment.id}`, {
        asymmetricMatch: () => ({ message: jasmine.any(String) }),
      })
      .reply(200, 'update endpoint called')
      .onDelete(`/comments/${mockComment.id}`)
      .reply(204, 'delete endpoint called')
      .onPost(`/comments/${mockComment.id}/toggleLike`)
      .reply(200, { isLikeAdded: true });

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

    service = TestBed.inject(CommentApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create new comment', async () => {
    const response = await service.createComment({
      postId: mockPostTitle.id,
      message: 'Lorem Ipsum',
      parentId: mockComment.id,
    });

    expect(response).toEqual('create endpoint called');
  });

  it('should return an object with utilities to create new comment asynchronously', async () => {
    const response = service.createCommentAsync;

    expect(asyncSpy.asAsync).toHaveBeenCalled();
    expect(response).toEqual({
      loading: jasmine.any(Function),
      error: jasmine.any(Function),
      value: jasmine.any(Function),
      execute: jasmine.any(Function),
    });
  });

  it('should update existing comment', async () => {
    const response = await service.updateComment({
      id: mockComment.id,
      message: 'Updated Lorem Ipsum',
    });

    expect(response).toBe('update endpoint called');
  });

  it('should return an object with utilities to update existing comment asynchronously', async () => {
    const response = service.updateCommentAsync;

    expect(asyncSpy.asAsync).toHaveBeenCalled();
    expect(response).toEqual({
      loading: jasmine.any(Function),
      error: jasmine.any(Function),
      value: jasmine.any(Function),
      execute: jasmine.any(Function),
    });
  });

  it('should delete existing comment', async () => {
    const response = await service.deleteComment(mockComment.id);

    expect(response).toBe('delete endpoint called');
  });

  it('should return an object with utilities to delete existing comment asynchronously', async () => {
    const response = service.deleteCommentAsync;

    expect(asyncSpy.asAsync).toHaveBeenCalled();
    expect(response).toEqual({
      loading: jasmine.any(Function),
      error: jasmine.any(Function),
      value: jasmine.any(Function),
      execute: jasmine.any(Function),
    });
  });

  it('should toggle comment like', async () => {
    const response = await service.toggleCommentLike(mockComment.id);

    expect(response).toEqual({ isLikeAdded: true });
  });

  it('should return an object with utilities to toggle comment like asynchronously', async () => {
    const response = service.toggleCommentLikeAsync;

    expect(asyncSpy.asAsync).toHaveBeenCalled();
    expect(response).toEqual({
      loading: jasmine.any(Function),
      error: jasmine.any(Function),
      value: jasmine.any(Function),
      execute: jasmine.any(Function),
    });
  });
});
