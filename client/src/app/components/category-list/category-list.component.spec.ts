import { ComponentFixture, TestBed } from '@angular/core/testing';

import { signal } from '@angular/core';
import { CategoryListComponent } from './category-list.component';
import { CategoryListService } from '../../services/category-list.service';
import { AnimationService, bgStates } from '../../services/animation.service';
import { LoginService } from '../../services/login.service';
import { acceptDeleteConfirmDialogAnd } from '../../../test/test.utils';
import { mockCategory } from '../../../test/mocks';

describe('CategoryListComponent', () => {
  let component: CategoryListComponent;
  let fixture: ComponentFixture<CategoryListComponent>;
  let categoryListSpy: jasmine.SpyObj<CategoryListService>;
  let animationSpy: jasmine.SpyObj<AnimationService>;
  let loginSpy: jasmine.SpyObj<LoginService>;
  let rootDiv: HTMLDivElement;
  const isAuthorLoggedIn = signal(false);

  beforeEach(async () => {
    categoryListSpy = jasmine.createSpyObj('CategoryListService', [
      'loading',
      'allCategories',
      'getCurrentCategory',
      'createCategory',
      'setCurrentCategory',
      'deleteCategory',
      'getCurrentCategory',
      'selectFirstCategory',
    ]);

    animationSpy = jasmine.createSpyObj('AnimationService', [
      'bgAnimationState',
    ]);

    loginSpy = jasmine.createSpyObj('LoginService', ['doesUserHaveAccess']);

    categoryListSpy.getCurrentCategory.and.returnValue(mockCategory.id);
    categoryListSpy.allCategories.and.returnValue([
      mockCategory,
      { ...mockCategory, id: 'fakeID2' },
    ]);
    animationSpy.bgAnimationState.and.returnValue(bgStates.none);
    loginSpy.doesUserHaveAccess.and.returnValue(isAuthorLoggedIn);
    isAuthorLoggedIn.set(false);

    await TestBed.configureTestingModule({
      imports: [CategoryListComponent],
      providers: [
        { provide: CategoryListService, useValue: categoryListSpy },
        { provide: AnimationService, useValue: animationSpy },
      ],
    })
      .overrideProvider(LoginService, { useValue: loginSpy })
      .compileComponents();

    fixture = TestBed.createComponent(CategoryListComponent);
    component = fixture.componentInstance;
    rootDiv =
      fixture.debugElement.nativeElement.querySelector('.category-list');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display all categories', () => {
    const categoryItemElements = rootDiv.querySelectorAll('app-category-item');

    expect(component.categories.length).toBe(
      categoryListSpy.allCategories().length,
    );
    expect(categoryItemElements.length).toBe(component.categories.length);
  });

  it('should display input if add category button is clicked', () => {
    const addCategoryButtonElement = rootDiv
      .querySelector('.add-button')
      ?.querySelector('button');
    addCategoryButtonElement?.click();
    fixture.detectChanges();

    expect(component.isInputActive()).toBeTrue();
  });

  it('should call createCategory if add button is clicked with non-empty input', () => {
    const addCategoryButtonElement = rootDiv
      .querySelector('.add-button')
      ?.querySelector('button');
    addCategoryButtonElement?.click();
    fixture.detectChanges();

    expect(component.isInputActive()).toBeTrue();

    const addCategoryInputElement = rootDiv
      .querySelector('.input-container')
      ?.querySelector('input');
    addCategoryInputElement!.value = mockCategory.title;
    addCategoryButtonElement?.click();
    fixture.detectChanges();

    expect(categoryListSpy.createCategory).toHaveBeenCalledWith(
      mockCategory.title,
    );
  });

  it('should call setCurrentCategory if a category item is clicked', () => {
    const categoryItemElement = rootDiv.querySelector('app-category-item');
    const categoryTitleElement = categoryItemElement?.querySelector('a');
    categoryTitleElement?.click();
    fixture.detectChanges();

    expect(categoryListSpy.setCurrentCategory).toHaveBeenCalledWith(
      categoryListSpy.allCategories()[0].id,
    );
  });

  it('should call deleteCategory if delete button is clicked and confirmed', (done) => {
    isAuthorLoggedIn.set(true);
    fixture.detectChanges();

    const deleteButtonElement = rootDiv
      .querySelector('app-category-item')
      ?.querySelector('app-icon-btn')
      ?.querySelector('button');
    deleteButtonElement?.click();
    fixture.detectChanges();
    acceptDeleteConfirmDialogAnd(() => {
      expect(categoryListSpy.deleteCategory).toHaveBeenCalledWith(
        categoryListSpy.allCategories()[0].id,
      );
      expect(categoryListSpy.selectFirstCategory).toHaveBeenCalled();
      done();
    });
  });

  it('should not be visible if animation finished', () => {
    component.animState.set(component.animStates.finished);
    fixture.detectChanges();
    const { visibility } = getComputedStyle(rootDiv);

    expect(visibility).toBe('hidden');
  });
});
