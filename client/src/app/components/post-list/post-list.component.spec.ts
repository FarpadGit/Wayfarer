import { ComponentFixture, TestBed } from '@angular/core/testing';

import { signal } from '@angular/core';
import { PostListComponent } from './post-list.component';
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
  const isAuthorLoggedIn = signal(false);

  beforeEach(async () => {
    postListSpy = jasmine.createSpyObj('PostListService', [
      'reloading',
      'error',
      'posts',
      'deletePost',
    ]);
    transitionSpy = jasmine.createSpyObj(
      'TransitionService',
      ['setNavigate', 'callDelayedNavigate'],
      { firstTime: true },
    );
    animationSpy = jasmine.createSpyObj('AnimationService', [
      'startEnterAnimation',
      'startCollapseAnimation',
      'startQuickEnterAnimation',
    ]);
    loginSpy = jasmine.createSpyObj('LoginService', ['doesUserHaveAccess']);

    postListSpy.reloading.and.returnValue(false);
    postListSpy.error.and.returnValue(null);
    postListSpy.posts.and.returnValue([
      { ...mockPostTitle, id: 'fakePostTitle1ID' },
      { ...mockPostTitle, id: 'fakePostTitle2ID' },
      { ...mockPostTitle, id: 'fakePostTitle3ID' },
    ]);
    loginSpy.doesUserHaveAccess.and.returnValue(isAuthorLoggedIn);
    isAuthorLoggedIn.set(false);

    await TestBed.configureTestingModule({
      imports: [PostListComponent],
      providers: [
        { provide: PostListService, useValue: postListSpy },
        { provide: TransitionService, useValue: transitionSpy },
        { provide: AnimationService, useValue: animationSpy },
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

    expect(component.posts.length).toBe(postListSpy.posts().length);
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
      jasmine.stringContaining(postListSpy.posts()[0].slug),
    );
    expect(animationSpy.startCollapseAnimation).toHaveBeenCalled();
    expect(component.animationState()).toBe(component.animStates.animating);
    expect(transitionSpy_firstTime?.set).toHaveBeenCalledWith(false);
  });

  it('should play a simple animation if a post item is clicked and it is not the first time', () => {
    setSpyProperty(transitionSpy, 'firstTime', false);

    const postItemElement = rootDiv.querySelector('app-post-item');
    const categoryTitleElement = postItemElement?.querySelector('a');
    categoryTitleElement?.click();
    fixture.detectChanges();

    expect(animationSpy.startQuickEnterAnimation).toHaveBeenCalled();
    expect(transitionSpy.callDelayedNavigate).toHaveBeenCalled();
  });

  it('should call deletePost if delete button is clicked and confirmed', (done) => {
    isAuthorLoggedIn.set(true);
    fixture.detectChanges();

    const deleteButtonElement = rootDiv
      .querySelector('app-post-item')
      ?.querySelector('app-icon-btn')
      ?.querySelector('button');
    deleteButtonElement?.click();
    fixture.detectChanges();

    acceptDeleteConfirmDialogAnd(() => {
      expect(postListSpy.deletePost).toHaveBeenCalledWith(
        postListSpy.posts()[0].id,
      );
      expect(component.paginator?.currentPage).toBe(0);
      done();
    });
  });

  it('should not be visible if animation finished', async () => {
    component.animationState.set(component.animStates.finished);
    fixture.detectChanges();
    await fixture.whenRenderingDone();
    await new Promise((res) => setTimeout(() => res(0), 300));
    const { visibility } = getComputedStyle(rootDiv);

    expect(visibility).toBe('hidden');
  });
});
