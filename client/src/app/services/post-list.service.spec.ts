import { TestBed } from '@angular/core/testing';

import { PostListService } from './post-list.service';
import { PostApiService } from './API/post.api.service';
import { mockCategory, mockPostTitle } from '../../test/mocks';

describe('PostListService', () => {
  let service: PostListService;
  let postApiSpy: jasmine.SpyObj<PostApiService>;
  let executeSpy: jasmine.Spy;
  const mockPosts = [mockPostTitle, mockPostTitle];

  beforeEach(() => {
    postApiSpy = jasmine.createSpyObj(
      'PostApiService',
      ['createPost', 'deletePost'],
      {
        getPostsAsync: {
          loading: () => false,
          error: () => null,
          value: () => mockPosts,
          execute: () => Promise.resolve(mockPosts),
        },
      }
    );

    postApiSpy.createPost.and.resolveTo();
    postApiSpy.deletePost.and.resolveTo();
    executeSpy = spyOn(postApiSpy.getPostsAsync, 'execute');
    executeSpy.and.callThrough();

    TestBed.configureTestingModule({
      providers: [{ provide: PostApiService, useValue: postApiSpy }],
    });

    service = TestBed.inject(PostListService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return loading signal value', () => {
    expect(service.reloading).toBe(postApiSpy.getPostsAsync.loading());
  });

  it('should return error signal value', () => {
    expect(service.error).toBe(postApiSpy.getPostsAsync.error());
  });

  it('should return value signal value', () => {
    expect(service.posts).toEqual(postApiSpy.getPostsAsync.value()!);
  });

  it("should set current active category and return all of it's posts", async () => {
    expect(service.getCurrentCategory()).toBe('');

    const testID = 'FakeCategoryID';
    const result = await service.getPostsByCategory(testID);

    expect(executeSpy).toHaveBeenCalledWith(testID);
    expect(service.getCurrentCategory()).toBe(testID);
  });

  it('should create new post and refetch all posts', (done) => {
    const testTitle = 'Fake New Post Title';
    const testBody = 'Lorem Ipsum Dolor Sit Amet';
    service.createPost(testTitle, testBody, mockCategory.id);

    setTimeout(() => {
      expect(postApiSpy.createPost).toHaveBeenCalledWith({
        title: testTitle,
        body: testBody,
        categoryId: mockCategory.id,
      });
      expect(executeSpy).toHaveBeenCalled();
      done();
    }, 0);
  });

  it('should delete post and refetch all posts', (done) => {
    service.deletePost(mockPostTitle.id);

    setTimeout(() => {
      expect(postApiSpy.deletePost).toHaveBeenCalledWith(mockPostTitle.id);
      expect(executeSpy).toHaveBeenCalled();
      done();
    }, 0);
  });
});
