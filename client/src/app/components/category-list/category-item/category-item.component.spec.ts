import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryItemComponent } from './category-item.component';
import { LoginService } from '../../../services/login.service';
import {
  acceptDeleteConfirmDialogAnd,
  setSpyProperty,
} from '../../../../test/test.utils';
import { mockCategory, mockUser } from '../../../../test/mocks';

describe('CategoryItemComponent', () => {
  let component: CategoryItemComponent;
  let fixture: ComponentFixture<CategoryItemComponent>;
  let loginSpy: jasmine.SpyObj<LoginService>;
  let rootDiv: HTMLDivElement;

  beforeEach(async () => {
    loginSpy = jasmine.createSpyObj('LoginService', [], {
      currentUserEmail: '',
    });

    await TestBed.configureTestingModule({
      imports: [CategoryItemComponent],
      providers: [{ provide: LoginService, useValue: loginSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoryItemComponent);
    component = fixture.componentInstance;
    component.id = mockCategory.id;
    component.title = mockCategory.title;
    component.creator = mockUser;
    component.uploadedSince = mockCategory.createdAt;
    component.isActive = false;
    rootDiv =
      fixture.debugElement.nativeElement.querySelector('.category-item');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display category title, creator and upload date', () => {
    const titleElement = rootDiv.querySelector('a');
    const detailsElement = rootDiv.querySelector('p');
    const formattedUploadDate = component.getUploadedSinceText(
      component.uploadedSince
    );

    expect(titleElement?.innerText.includes(component.title)).toBeTrue();
    expect(
      detailsElement?.innerText.includes(component.creator.name)
    ).toBeTrue();
    expect(detailsElement?.innerText.includes(formattedUploadDate)).toBeTrue();
  });

  it('should display delete button if creator is logged in', () => {
    setSpyProperty(loginSpy, 'currentUserEmail', component.creator.email);
    fixture.detectChanges();
    const iconButtonElement = rootDiv.querySelector('app-icon-btn');

    expect(component.authorLoggedIn).toBeTrue();
    expect(iconButtonElement).not.toBeNull();
  });

  it('should emit component ID when title is clicked', (done) => {
    component.onClick.subscribe((e: string) => {
      expect(e).toBe(component.id);
      done();
    });

    const titleElement = rootDiv.querySelector('a');
    titleElement?.click();
  });

  it('should emit component ID when delete button is clicked', (done) => {
    component.onDeleteClick.subscribe((e: string) => {
      expect(component.isDeleting).toBeTrue();
      expect(e).toBe(component.id);
      done();
    });

    setSpyProperty(loginSpy, 'currentUserEmail', component.creator.email);
    fixture.detectChanges();

    const deleteButtonElement = rootDiv
      .querySelector('app-icon-btn')
      ?.querySelector('button');
    deleteButtonElement?.click();
    fixture.detectChanges();
    acceptDeleteConfirmDialogAnd(null);
  });
});
