import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostItemComponent } from './post-item.component';
import { LoginService } from '../../../services/login.service';
import {
  acceptDeleteConfirmDialogAnd,
  setSpyProperty,
} from '../../../../test/test.utils';
import { mockPostTitle } from '../../../../test/mocks';

describe('PostItemComponent', () => {
  let component: PostItemComponent;
  let fixture: ComponentFixture<PostItemComponent>;
  let loginSpy: jasmine.SpyObj<LoginService>;
  let rootDiv: HTMLDivElement;

  beforeEach(async () => {
    loginSpy = jasmine.createSpyObj('LoginService', [], {
      currentUserEmail: '',
    });

    await TestBed.configureTestingModule({
      imports: [PostItemComponent],
      providers: [{ provide: LoginService, useValue: loginSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(PostItemComponent);
    component = fixture.componentInstance;
    component.id = mockPostTitle.id;
    component.title = mockPostTitle.title;
    component.uploader = mockPostTitle.uploader;
    component.uploadedSince = mockPostTitle.createdAt;
    rootDiv = fixture.debugElement.nativeElement.querySelector('.post-item');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display post title, uploader and upload date', () => {
    const titleElement = rootDiv.querySelector('a');
    const detailsElement = rootDiv.querySelector('p');
    const formattedUploadDate = component.getUploadedSinceText(
      component.uploadedSince
    );

    expect(titleElement?.innerText.includes(component.title)).toBeTrue();
    expect(
      detailsElement?.innerText.includes(component.uploader.name)
    ).toBeTrue();
    expect(detailsElement?.innerText.includes(formattedUploadDate)).toBeTrue();
  });

  it('should display delete button if uploader is logged in', () => {
    setSpyProperty(loginSpy, 'currentUserEmail', component.uploader.email);
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

    setSpyProperty(loginSpy, 'currentUserEmail', component.uploader.email);
    fixture.detectChanges();

    const deleteButtonElement = rootDiv
      .querySelector('app-icon-btn')
      ?.querySelector('button');
    deleteButtonElement?.click();
    fixture.detectChanges();
    acceptDeleteConfirmDialogAnd(null);
  });
});
