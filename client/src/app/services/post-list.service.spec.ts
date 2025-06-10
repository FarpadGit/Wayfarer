import { TestBed, waitForAsync } from '@angular/core/testing';

import { PostListService } from './post-list.service';
import { PostApiService } from './API/post.api.service';
import { ImagesApiService } from './API/images.api.service';
import { mockCategory, mockPostTitle } from '../../test/mocks';

describe('PostListService', () => {
  let service: PostListService;
  let postApiSpy: jasmine.SpyObj<PostApiService>;
  let imagesApiSpy: jasmine.SpyObj<ImagesApiService>;
  let executeSpy: jasmine.Spy;
  const mockPosts = [mockPostTitle, mockPostTitle];
  const mockCreatedPostId = 'fakeCreatedPostID';
  const mockLoggedInUserId = 'fakeLoggedInUserID';
  const mockDeletedImages = { images: ['fakeImg.jpg'] };

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
        userId: mockLoggedInUserId,
      }
    );
    imagesApiSpy = jasmine.createSpyObj('ImagesApiService', [
      'uploadImages',
      'deleteImages',
    ]);

    postApiSpy.createPost.and.resolveTo(mockCreatedPostId);
    postApiSpy.deletePost.and.resolveTo(mockDeletedImages);
    imagesApiSpy.uploadImages.and.resolveTo();
    imagesApiSpy.deleteImages.and.resolveTo();
    executeSpy = spyOn(postApiSpy.getPostsAsync, 'execute').and.callThrough();

    TestBed.configureTestingModule({
      providers: [
        { provide: PostApiService, useValue: postApiSpy },
        { provide: ImagesApiService, useValue: imagesApiSpy },
      ],
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

  it('should create new post and refetch all posts', waitForAsync(() => {
    const testTitle = 'Fake New Post Title';
    const testBody = 'Lorem Ipsum Dolor Sit Amet';
    const testImages = [
      {
        name: 'fakeImg.jpg',
        url: 'fakeurl.com',
      },
    ];

    service.createPost(testTitle, testBody, testImages, mockCategory.id);

    setTimeout(() => {
      expect(postApiSpy.createPost).toHaveBeenCalledWith({
        title: testTitle,
        body: testBody,
        categoryId: mockCategory.id,
      });
      expect(imagesApiSpy.uploadImages).toHaveBeenCalledWith(
        [
          {
            name: 'fakeImg.jpg',
            src: 'fakeurl.com',
          },
        ],
        mockCreatedPostId,
        mockLoggedInUserId
      );
      expect(executeSpy).toHaveBeenCalled();
    }, 0);
  }));

  it('should delete post and refetch all posts', waitForAsync(() => {
    service.deletePost(mockPostTitle.id);

    setTimeout(() => {
      expect(postApiSpy.deletePost).toHaveBeenCalledWith(mockPostTitle.id);
      expect(imagesApiSpy.deleteImages).toHaveBeenCalledWith(
        mockDeletedImages.images
      );
      expect(executeSpy).toHaveBeenCalled();
    }, 0);
  }));
});
