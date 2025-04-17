import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { PostListComponent } from './post-list.component';
import { animStates } from './animations';
import { PostListService } from '../../services/post-list.service';
import { TransitionService } from '../../services/transition.service';
import { AnimationService } from '../../services/animation.service';
import { LoginService } from '../../services/login.service';
import {
  acceptDeleteConfirmDialogAnd,
  getSpyProperty,
  setSpyProperty,
} from '../../../test/test.utils';
import { mockPostTitle } from '../../../test/mocks';

describe('PostListComponent', () => {
  let component: PostListComponent;
  let fixture: ComponentFixture<PostListComponent>;
  let postListSpy: jasmine.SpyObj<PostListService>;
  let transitionSpy: jasmine.SpyObj<TransitionService>;
  let animationSpy: jasmine.SpyObj<AnimationService>;
  let loginSpy: jasmine.SpyObj<LoginService>;
  let rootDiv: HTMLDivElement;

  beforeEach(async () => {
    postListSpy = jasmine.createSpyObj('PostListService', ['deletePost'], {
      reloading: false,
      error: null,
      posts: [
        { ...mockPostTitle, id: 'fakePostTitle1ID' },
        { ...mockPostTitle, id: 'fakePostTitle2ID' },
        { ...mockPostTitle, id: 'fakePostTitle3ID' },
      ],
    });
    transitionSpy = jasmine.createSpyObj(
      'TransitionService',
      ['setNavigate', 'callDelayedNavigate'],
      {
        firstTime: true,
        blur: false,
      }
    );
    animationSpy = jasmine.createSpyObj('AnimationService', [
      'startEnterAnimation',
      'startCollapseAnimation',
    ]);
    loginSpy = jasmine.createSpyObj('LoginService', [], {
      currentUserEmail: '',
    });

    await TestBed.configureTestingModule({
      imports: [PostListComponent],
      providers: [
        { provide: PostListService, useValue: postListSpy },
        { provide: TransitionService, useValue: transitionSpy },
        { provide: AnimationService, useValue: animationSpy },
        provideNoopAnimations(),
      ],
    })
      .overrideProvider(LoginService, { useValue: loginSpy })
      .compileComponents();

    fixture = TestBed.createComponent(PostListComponent);
    component = fixture.componentInstance;
    rootDiv = fixture.debugElement.nativeElement.querySelector('.post-list');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display all posts', () => {
    const postItemElements = rootDiv.querySelectorAll('app-post-item');

    expect(component.posts.length).toBe(postListSpy.posts.length);
    expect(postItemElements.length).toBe(component.posts.length);
  });

  it('should display new post button', () => {
    const newPostButton = rootDiv.querySelector('app-new-post-button');

    expect(newPostButton).toBeTruthy();
  });

  it('should display paginator element', () => {
    const paginatorElement = rootDiv.querySelector('app-paginator');

    expect(paginatorElement).toBeTruthy();
  });

  it('should set up navigation and animation sequence if a post item is clicked', () => {
    const transitionSpy_firstTime = getSpyProperty(transitionSpy, 'firstTime');
    const postItemElement = rootDiv.querySelector('app-post-item');
    const categoryTitleElement = postItemElement?.querySelector('a');
    categoryTitleElement?.click();
    fixture.detectChanges();

    expect(transitionSpy.setNavigate).toHaveBeenCalledWith(
      jasmine.stringContaining(postListSpy.posts[0].id)
    );
    expect(animationSpy.startCollapseAnimation).toHaveBeenCalled();
    expect(component.animationState).toBe(animStates.animating);
    expect(transitionSpy_firstTime?.set).toHaveBeenCalledWith(false);
  });

  it('should play a simple animation if a post item is clicked and it is not the first time', () => {
    const transitionSpy_blur = getSpyProperty(transitionSpy, 'blur');
    setSpyProperty(transitionSpy, 'firstTime', false);

    const postItemElement = rootDiv.querySelector('app-post-item');
    const categoryTitleElement = postItemElement?.querySelector('a');
    categoryTitleElement?.click();
    fixture.detectChanges();

    expect(transitionSpy_blur?.set).toHaveBeenCalledWith(true);
    expect(transitionSpy.callDelayedNavigate).toHaveBeenCalled();
  });

  it('should call deletePost if delete button is clicked and confirmed', (done) => {
    setSpyProperty(
      loginSpy,
      'currentUserEmail',
      postListSpy.posts[0].uploader.email
    );
    fixture.detectChanges();

    const deleteButtonElement = rootDiv
      .querySelector('app-post-item')
      ?.querySelector('app-icon-btn')
      ?.querySelector('button');
    deleteButtonElement?.click();
    fixture.detectChanges();

    acceptDeleteConfirmDialogAnd(() => {
      expect(postListSpy.deletePost).toHaveBeenCalledWith(
        postListSpy.posts[0].id
      );
      expect(component.paginator?.currentPage).toBe(0);
      done();
    });
  });

  it('should not be visible if animation finished', async () => {
    component.animationState = component.animStates.finished;
    fixture.detectChanges();
    await fixture.whenStable();

    expect(rootDiv.style.visibility).toBe('hidden');
  });
});
