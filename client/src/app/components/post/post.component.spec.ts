import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostComponent } from './post.component';
import { PostService } from '../../services/post.service';
import { TransitionService } from '../../services/transition.service';
import { AnimationService, bgStates } from '../../services/animation.service';
import { LoginService } from '../../services/login.service';
import { CommentFormComponent } from '../UI/comment-form/comment-form.component';
import { setSpyProperty } from '../../../test/test.utils';
import { mockComment, mockPost } from '../../../test/mocks';

describe('PostComponent', () => {
  let component: PostComponent;
  let fixture: ComponentFixture<PostComponent>;
  let postSpy: jasmine.SpyObj<PostService>;
  let transitionSpy: jasmine.SpyObj<TransitionService>;
  let animationSpy: jasmine.SpyObj<AnimationService>;
  let rootDiv: HTMLDivElement;
  const mockRootComments = [
    { ...mockComment, id: 'fakeComment1ID' },
    { ...mockComment, id: 'fakeComment2ID' },
    { ...mockComment, id: 'fakeComment3ID' },
  ];

  beforeEach(async () => {
    postSpy = jasmine.createSpyObj(
      'PostService',
      [
        'updatePost',
        'localComments',
        'createComment',
        'isAuthorLoggedIn',
        'getReplies',
      ],
      {
        loading: false,
        error: null,
        post: mockPost,
        isAuthorLoggedIn: false,
        rootComments: [],
      },
    );
    transitionSpy = jasmine.createSpyObj('TransitionService', [
      'callNavigate',
      'callDelayedNavigate',
    ]);
    animationSpy = jasmine.createSpyObj('AnimationService', [
      'bgAnimationState',
      'startExitAnimation',
    ]);

    animationSpy.bgAnimationState.and.returnValue(bgStates.none);

    await TestBed.configureTestingModule({
      imports: [PostComponent],
      providers: [
        { provide: PostService, useValue: postSpy },
        { provide: TransitionService, useValue: transitionSpy },
        { provide: AnimationService, useValue: animationSpy },
      ],
    })
      .overrideComponent(PostComponent, {
        remove: { providers: [PostService] },
        add: {
          providers: [
            {
              provide: LoginService,
              useValue: { doesUserHaveAccess: () => () => false },
            },
          ],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(PostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    rootDiv =
      fixture.debugElement.nativeElement.querySelector('.post-container');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display title, body, image attachments and comment input form on successful fetch', () => {
    const titleElement = rootDiv.querySelector('h1');
    const bodyElement = rootDiv.querySelector('article');
    const imageSectionElement = rootDiv.querySelector('.image-section');
    const images = Array.from(
      imageSectionElement?.querySelectorAll('img') || [],
    );
    const commentFormElement = fixture.debugElement.query(
      (e) => e.name === 'app-comment-form',
    );

    expect(component.loadingState).toBe('success');
    expect(component.post).toEqual(mockPost);
    expect(titleElement?.innerText)
      .withContext('title mismatch')
      .toMatch(mockPost.title);
    expect(bodyElement?.innerText)
      .withContext('body mismatch')
      .toMatch(mockPost.body);
    expect(images.length).toBe(mockPost.images!.length);
    for (let i = 0; i < images.length; i++) {
      expect(images[i].src)
        .withContext('image mismatch')
        .toMatch(mockPost.images![i].thumbnail!);
    }
    expect(commentFormElement).toBeTruthy();
  });

  it('should display post comments on successful fetch', () => {
    setSpyProperty(postSpy, 'rootComments', mockRootComments);
    postSpy.localComments.and.returnValue(mockRootComments);
    fixture.detectChanges();
    const commentList = fixture.debugElement.query(
      (e) => e.name === 'app-comment-list',
    );
    const comments = fixture.debugElement.queryAll(
      (e) => e.name === 'app-comment',
    );

    expect(component.comments).toEqual(mockRootComments);
    expect(component.rootComments).toEqual(mockRootComments);
    expect(component.loadingState).toBe('success');
    expect(commentList).toBeTruthy();
    expect(comments.length).toBe(mockRootComments.length);
  });

  it('should navigate back on back button click', () => {
    const backButton = rootDiv
      .querySelector('[data-test-back-btn]')
      ?.querySelector('button');
    backButton?.click();
    fixture.detectChanges();

    expect(animationSpy.startExitAnimation).toHaveBeenCalled();
    expect(transitionSpy.callDelayedNavigate).toHaveBeenCalled();
  });

  it('should display an edit button if author is logged in', () => {
    setSpyProperty(postSpy, 'isAuthorLoggedIn', true);
    fixture.detectChanges();
    const editButton = rootDiv.querySelector('[data-test-edit-btn]');

    expect(editButton).toBeTruthy();
  });

  it('should replace post title and article with edit elements and also display a cancel button if edit button is clicked', () => {
    setSpyProperty(postSpy, 'isAuthorLoggedIn', true);
    fixture.detectChanges();
    const editButton = rootDiv
      .querySelector('[data-test-edit-btn]')
      ?.querySelector('button');
    editButton?.click();
    fixture.detectChanges();
    const titleInput = rootDiv.querySelector('input.title-edit');
    const bodyTextarea = rootDiv.querySelector('textarea.body-edit');
    const cancelButton = rootDiv.querySelector('[data-test-cancel-btn]');

    expect(titleInput).toBeTruthy();
    expect(bodyTextarea).toBeTruthy();
    expect(cancelButton).toBeTruthy();
  });

  it('should update post contents and reload post page with new slug', async () => {
    const newSlug = 'mockNewSlug';
    component.isEditModeSignal.set(true);
    postSpy.updatePost.and.resolveTo(newSlug);
    await component.onPostEdit();

    expect(postSpy.updatePost).toHaveBeenCalled();
    expect(transitionSpy.callNavigate).toHaveBeenCalledWith(
      '/posts/' + newSlug,
      true,
    );
  });

  it('should create new comment if comment form is submitted with text', () => {
    const newCommentText = 'Fake New Comment';
    const commentFormComponent = fixture.debugElement.query(
      (e) => e.name === 'app-comment-form',
    ).componentInstance as CommentFormComponent;
    commentFormComponent.message = newCommentText;
    commentFormComponent.handleSubmit();

    expect(postSpy.createComment).toHaveBeenCalledWith(newCommentText);
  });

  it('should display loader if in loading state', () => {
    setSpyProperty(postSpy, 'loading', true);
    fixture.detectChanges();
    const loader = fixture.debugElement.query((e) => e.name === 'app-loader');

    expect(component.loadingState).toBe('loading');
    expect(loader).toBeTruthy();
  });

  it('should display error message if in error state', () => {
    setSpyProperty(postSpy, 'error', 'Some Error');
    fixture.detectChanges();
    const errorElement = fixture.debugElement.query(
      (e) => e.classes['error-msg'] === true,
    );

    expect(component.loadingState).toBe('error');
    expect(errorElement).toBeTruthy();
  });
});
