import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { LandingComponent } from './landing.component';
import { CategoryListService } from '../../services/category-list.service';
import { PostListService } from '../../services/post-list.service';
import { setSpyProperty } from '../../../test/test.utils';

describe('LandingComponent', () => {
  let component: LandingComponent;
  let fixture: ComponentFixture<LandingComponent>;
  let categoryListSpy: jasmine.SpyObj<CategoryListService>;
  let postListSpy: jasmine.SpyObj<PostListService>;

  beforeEach(async () => {
    categoryListSpy = jasmine.createSpyObj(
      'CategoryListService',
      ['refreshCategories', 'selectFirstCategory'],
      { error: null, allCategories: [] }
    );
    postListSpy = jasmine.createSpyObj('PostListService', [], {
      error: null,
      posts: [],
    });

    categoryListSpy.refreshCategories.and.resolveTo();
    categoryListSpy.selectFirstCategory.and.resolveTo();

    await TestBed.configureTestingModule({
      imports: [LandingComponent],
      providers: [
        { provide: CategoryListService, useValue: categoryListSpy },
        { provide: PostListService, useValue: postListSpy },
        provideNoopAnimations(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LandingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    // wait for Promise.then to finish in ngOnInit
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should retrieve all categories on init', () => {
    expect(categoryListSpy.refreshCategories).toHaveBeenCalled();
    expect(component.loaded).toBeTrue();
    expect(component.loadingState).toBe('success');
  });

  it('should display category list and post list on successful fetch', () => {
    const categoryList = fixture.debugElement.query(
      (e) => e.name === 'app-category-list'
    );
    const postList = fixture.debugElement.query(
      (e) => e.name === 'app-post-list'
    );
    const loader = fixture.debugElement.query((e) => e.name === 'app-loader');
    const errorElement = fixture.debugElement.query(
      (e) => e.classes['error-msg'] === true
    );

    expect(categoryList).toBeTruthy();
    expect(postList).toBeTruthy();
    expect(loader).toBeFalsy();
    expect(errorElement).toBeFalsy();
  });

  it('should display loader on loading state', () => {
    component.loaded = false;
    fixture.detectChanges();
    const categoryList = fixture.debugElement.query(
      (e) => e.name === 'app-category-list'
    );
    const postList = fixture.debugElement.query(
      (e) => e.name === 'app-post-list'
    );
    const loader = fixture.debugElement.query((e) => e.name === 'app-loader');
    const errorElement = fixture.debugElement.query(
      (e) => e.classes['error-msg'] === true
    );

    expect(component.loadingState).toBe('loading');
    expect(categoryList).toBeFalsy();
    expect(postList).toBeFalsy();
    expect(loader).toBeTruthy();
    expect(errorElement).toBeFalsy();
  });

  it('should display error message on error state', () => {
    setSpyProperty(categoryListSpy, 'error', 'Some Error');
    fixture.detectChanges();
    const categoryList = fixture.debugElement.query(
      (e) => e.name === 'app-category-list'
    );
    const postList = fixture.debugElement.query(
      (e) => e.name === 'app-post-list'
    );
    const loader = fixture.debugElement.query((e) => e.name === 'app-loader');
    const errorElement = fixture.debugElement.query(
      (e) => e.classes['error-msg'] === true
    );

    expect(component.loadingState).toBe('error');
    expect(categoryList).toBeFalsy();
    expect(postList).toBeFalsy();
    expect(loader).toBeFalsy();
    expect(errorElement).toBeTruthy();
  });
});
