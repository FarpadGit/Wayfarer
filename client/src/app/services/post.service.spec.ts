import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { PostService } from './post.service';
import { LoginService } from './login.service';
import { PostApiService } from './API/post.api.service';
import { CommentApiService } from './API/comment.api.service';
import {
  mockComment,
  mockComment_child,
  mockPost,
  mockPostTitle,
  mockUser,
} from '../../test/mocks';

describe('PostService', () => {
  let service: PostService;
  let routeSpy: jasmine.SpyObj<ActivatedRoute>;
  let postApiSpy: jasmine.SpyObj<PostApiService>;
  let commentApiSpy: jasmine.SpyObj<CommentApiService>;
  let loginSpy: jasmine.SpyObj<LoginService>;
  const mockPostWithComments = {
    ...mockPost,
    comments: [
      { ...mockComment, id: 'MockComment1ID', parentId: null },
      { ...mockComment, id: 'MockComment2ID', parentId: null },
      { ...mockComment, id: 'MockComment3ID', parentId: null },
      { ...mockComment, id: 'MockComment4ID', parentId: null },
      { ...mockComment, id: 'MockComment5ID', parentId: 'MockComment1ID' },
      { ...mockComment, id: 'MockComment6ID', parentId: 'MockComment1ID' },
      { ...mockComment, id: 'MockComment7ID', parentId: 'MockComment2ID' },
    ],
  };

  beforeEach(async () => {
    routeSpy = jasmine.createSpyObj('ActivatedRoute', [], {
      params: of({ id: mockPostTitle.id }),
    });
    postApiSpy = jasmine.createSpyObj('PostApiService', [], {
      getPostAsync: {
        loading: () => false,
        error: () => null,
        value: () => mockPostWithComments,
        execute: () => Promise.resolve(mockPostWithComments),
      },
    });
    commentApiSpy = jasmine.createSpyObj('CommentApiService', [
      'createComment',
      'updateComment',
      'deleteComment',
      'toggleCommentLike',
    ]);
    loginSpy = jasmine.createSpyObj('LoginService', [], {
      currentUserEmail: mockUser.email,
      currentUserName: mockUser.name,
    });

    commentApiSpy.createComment.and.resolveTo('FakeCreatedCommentID');

    TestBed.configureTestingModule({
      providers: [
        { provide: ActivatedRoute, useValue: routeSpy },
        { provide: PostApiService, useValue: postApiSpy },
        { provide: CommentApiService, useValue: commentApiSpy },
        { provide: LoginService, useValue: loginSpy },
      ],
    });

    service = TestBed.inject(PostService);

    // necessary for fetching post in constructor with promise chaining
    await new Promise((res) => setTimeout(() => res(0), 0));
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load post and comments if ActivatedRoute has corresponding "id" parameter', () => {
    expect(service.id).toBeTruthy();
    expect(service.localComments().length).toBe(7);
  });

  it('should return loading signal value', () => {
    expect(service.loading).toBe(postApiSpy.getPostAsync.loading());
  });

  it('should return error signal value', () => {
    expect(service.error).toBe(postApiSpy.getPostAsync.error());
  });

  it('should return value signal value', () => {
    expect(service.post).toEqual(postApiSpy.getPostAsync.value());
  });

  it('should get all root comments', () => {
    const rootcomments = mockPostWithComments.comments.filter(
      (comment) => comment.parentId == null
    );

    expect(service.rootComments).toEqual(rootcomments);
  });

  it('should get all replies to comment', () => {
    const testCommentID = 'MockComment1ID';
    const replies = mockPostWithComments.comments.filter(
      (comment) => comment.parentId === testCommentID
    )!;

    expect(service.getReplies(testCommentID)).toEqual(replies);
  });

  it('should create new local comment, send creation request to server and replace local comment ID with returned ID', (done) => {
    service.localComments.set([]);
    const message = 'Fake Comment Message';

    service.createComment(message);

    expect(commentApiSpy.createComment).toHaveBeenCalledWith({
      postId: mockPostTitle.id,
      message,
      parentId: null,
    });
    expect(service.localComments().length).toBe(1);

    setTimeout(() => {
      expect(service.localComments()[0].id).toBe('FakeCreatedCommentID');
      done();
    }, 0);
  });

  it('should update comment locally and on server', () => {
    const testMessage = 'Fake Updated Comment';
    service.localComments.set([mockComment, mockComment_child]);

    service.updateComment(mockComment_child.id, testMessage);

    expect(service.localComments()).toEqual([
      mockComment,
      { ...mockComment_child, message: testMessage },
    ]);
    expect(commentApiSpy.updateComment).toHaveBeenCalledWith({
      id: mockComment_child.id,
      message: testMessage,
    });
  });

  it('should delete comment locally and from server', () => {
    service.localComments.set([mockComment, mockComment_child]);

    service.deleteComment(mockComment_child.id);

    expect(service.localComments()).toEqual([mockComment]);
    expect(commentApiSpy.deleteComment).toHaveBeenCalledWith(
      mockComment_child.id
    );
  });

  it('should toggle comment like locally and on server (on)', () => {
    service.localComments.set([mockComment, mockComment_child]);

    service.toggleCommentLike(mockComment.id, true);

    expect(service.localComments()).toEqual([
      {
        ...mockComment,
        isLikedByMe: true,
        likeCount: mockComment.likeCount + 1,
      },
      mockComment_child,
    ]);
    expect(commentApiSpy.toggleCommentLike).toHaveBeenCalledWith(
      mockComment.id
    );
  });

  it('should toggle comment like locally and on server (off)', () => {
    service.localComments.set([mockComment, mockComment_child]);

    service.toggleCommentLike(mockComment_child.id, false);

    expect(service.localComments()).toEqual([
      mockComment,
      {
        ...mockComment_child,
        isLikedByMe: false,
        likeCount: mockComment_child.likeCount - 1,
      },
    ]);
    expect(commentApiSpy.toggleCommentLike).toHaveBeenCalledWith(
      mockComment_child.id
    );
  });
});
