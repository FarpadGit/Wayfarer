import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { PostComponent } from './post.component';
import { CommentFormComponent } from '../UI/comment-form/comment-form.component';
import { PostService } from '../../services/post.service';
import { TransitionService } from '../../services/transition.service';
import { AnimationService, bgStates } from '../../services/animation.service';
import { LoginService } from '../../services/login.service';
import { setSpyProperty } from '../../../test/test.utils';
import { mockComment, mockPost } from '../../../test/mocks';

// There's a bug in @ngx-env/builder:karma v19.0.4 (the tests' builder), where overriding parts of the testing module doesn't work
// (PostComponent provides its own instance of PostService instead of a global singleton and needs to be replaced with overrideComponent)
// temporarily disabling test group until fix
// (if you need to run these tests comment out the overrideComponent part here and the "providers: [PostService]" in the .ts file, for isolated tests that's fine)
xdescribe('PostComponent', () => {
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
      ['localComments', 'createComment', 'getReplies'],
      {
        loading: false,
        error: null,
        post: mockPost,
        rootComments: [],
      }
    );
    transitionSpy = jasmine.createSpyObj('TransitionService', [
      'callDelayedNavigate',
    ]);
    animationSpy = jasmine.createSpyObj(
      'AnimationService',
      ['startExitAnimation'],
      { bgAnimationState: bgStates.none }
    );

    await TestBed.configureTestingModule({
      imports: [PostComponent],
      providers: [
        { provide: PostService, useValue: postSpy },
        { provide: TransitionService, useValue: transitionSpy },
        { provide: AnimationService, useValue: animationSpy },
        { provide: LoginService, useValue: { currentUserEmail: '' } },
        provideNoopAnimations(),
      ],
    })
      .overrideComponent(PostComponent, {
        remove: { providers: [PostService] },
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

  it('should display title, body and comment input form on successful fetch', () => {
    const titleElement = rootDiv.querySelector('h1');
    const bodyElement = rootDiv.querySelector('article');
    const commentFormElement = fixture.debugElement.query(
      (e) => e.name === 'app-comment-form'
    );

    expect(component.loadingState).toBe('success');
    expect(component.post).toEqual(mockPost);
    expect(titleElement?.innerText.includes(mockPost.title)).toBeTrue();
    expect(bodyElement?.innerText.includes(mockPost.body)).toBeTrue();
    expect(commentFormElement).toBeTruthy();
  });

  it('should display post comments on successful fetch', () => {
    setSpyProperty(postSpy, 'rootComments', mockRootComments);
    postSpy.localComments.and.returnValue(mockRootComments);
    fixture.detectChanges();
    const commentList = fixture.debugElement.query(
      (e) => e.name === 'app-comment-list'
    );
    const comments = fixture.debugElement.queryAll(
      (e) => e.name === 'app-comment'
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

  it('should create new comment if comment form is submitted with text', () => {
    const newCommentText = 'Fake New Comment';
    const commentFormComponent = fixture.debugElement.query(
      (e) => e.name === 'app-comment-form'
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
      (e) => e.classes['error-msg'] === true
    );

    expect(component.loadingState).toBe('error');
    expect(errorElement).toBeTruthy();
  });
});
