import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Component } from '@angular/core';
import { LandingComponent } from './landing.component';
import { CategoryListService } from '../../services/category-list.service';
import { PostListService } from '../../services/post-list.service';
import { ImagesApiService } from '../../services/API/images.api.service';
import { CategoryListComponent } from '../category-list/category-list.component';
import { PostListComponent } from '../post-list/post-list.component';

@Component({
  selector: 'app-category-list, app-post-list',
  standalone: true,
  template: '',
})
export class mockComponent {}

describe('LandingComponent', () => {
  let component: LandingComponent;
  let fixture: ComponentFixture<LandingComponent>;
  let categoryListSpy: jasmine.SpyObj<CategoryListService>;
  let postListSpy: jasmine.SpyObj<PostListService>;
  let imageSpy: jasmine.SpyObj<ImagesApiService>;

  beforeEach(async () => {
    categoryListSpy = jasmine.createSpyObj('CategoryListService', [
      'error',
      'refreshCategories',
      'getCurrentCategory',
      'selectFirstCategory',
    ]);
    postListSpy = jasmine.createSpyObj('PostListService', ['error']);
    imageSpy = jasmine.createSpyObj('ImagesApiService', ['pingServer']);

    categoryListSpy.error.and.returnValue(null);
    categoryListSpy.refreshCategories.and.resolveTo();
    categoryListSpy.selectFirstCategory.and.resolveTo();
    categoryListSpy.getCurrentCategory.and.returnValue('');
    postListSpy.error.and.returnValue(null);

    await TestBed.configureTestingModule({
      imports: [LandingComponent],
      providers: [
        { provide: CategoryListService, useValue: categoryListSpy },
        { provide: PostListService, useValue: postListSpy },
        { provide: ImagesApiService, useValue: imageSpy },
      ],
    })
      .overrideComponent(LandingComponent, {
        remove: { imports: [CategoryListComponent, PostListComponent] },
        add: { imports: [mockComponent] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(LandingComponent);
    component = fixture.componentInstance;
  });

  it('should create', async () => {
    await component.ngOnInit();
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('should wake up (ping) the image server on startup', async () => {
    await component.ngOnInit();
    fixture.detectChanges();

    expect(imageSpy.pingServer).toHaveBeenCalled();
  });

  it('should retrieve all categories on init', async () => {
    await component.ngOnInit();
    fixture.detectChanges();

    expect(categoryListSpy.refreshCategories).toHaveBeenCalled();
    expect(component.loadingState).toBe('success');
  });

  it('should display category list and post list on successful fetch', async () => {
    await component.ngOnInit();
    fixture.detectChanges();
    const categoryList = fixture.debugElement.query(
      (e) => e.name === 'app-category-list',
    );
    const postList = fixture.debugElement.query(
      (e) => e.name === 'app-post-list',
    );
    const loader = fixture.debugElement.query((e) => e.name === 'app-loader');
    const errorElement = fixture.debugElement.query(
      (e) => e.classes['error-msg'] === true,
    );

    expect(categoryList).toBeTruthy();
    expect(postList).toBeTruthy();
    expect(loader).toBeFalsy();
    expect(errorElement).toBeFalsy();
  });

  it('should display loader on loading state', () => {
    fixture.detectChanges();
    const categoryList = fixture.debugElement.query(
      (e) => e.name === 'app-category-list',
    );
    const postList = fixture.debugElement.query(
      (e) => e.name === 'app-post-list',
    );
    const loader = fixture.debugElement.query((e) => e.name === 'app-loader');
    const errorElement = fixture.debugElement.query(
      (e) => e.classes['error-msg'] === true,
    );

    expect(component.loadingState).toBe('loading');
    expect(categoryList).toBeFalsy();
    expect(postList).toBeFalsy();
    expect(loader).toBeTruthy();
    expect(errorElement).toBeFalsy();
  });

  it('should display error message on error state', async () => {
    categoryListSpy.error.and.returnValue('Some Error');
    await component.ngOnInit();
    fixture.detectChanges();
    const categoryList = fixture.debugElement.query(
      (e) => e.name === 'app-category-list',
    );
    const postList = fixture.debugElement.query(
      (e) => e.name === 'app-post-list',
    );
    const loader = fixture.debugElement.query((e) => e.name === 'app-loader');
    const errorElement = fixture.debugElement.query(
      (e) => e.classes['error-msg'] === true,
    );

    expect(component.loadingState).toBe('error');
    expect(categoryList).toBeFalsy();
    expect(postList).toBeFalsy();
    expect(loader).toBeFalsy();
    expect(errorElement).toBeTruthy();
  });
});
