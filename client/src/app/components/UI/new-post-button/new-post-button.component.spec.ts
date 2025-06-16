import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewPostButtonComponent } from './new-post-button.component';
import { PostListService } from '../../../services/post-list.service';
import { ModalService } from 'ngx-modal-ease';

describe('NewPostButtonComponent', () => {
  let component: NewPostButtonComponent;
  let fixture: ComponentFixture<NewPostButtonComponent>;
  let modalSpy: jasmine.SpyObj<ModalService>;
  let postListSpy: jasmine.SpyObj<PostListService>;
  const testValues = {
    title: 'Fake New Post Title',
    body: 'Lorem Ipsum Dolor Sit Amet',
    files: [new File([], 'fakeImg1.jpg')],
    categoryID: 'fakeCategoryID',
  };

  beforeEach(async () => {
    modalSpy = jasmine.createSpyObj('ModalService', ['open']);
    postListSpy = jasmine.createSpyObj('PostListService', [
      'getCurrentCategory',
      'createPost',
    ]);

    modalSpy.open.and.resolveTo({
      data: {
        title: testValues.title,
        body: testValues.body,
        files: testValues.files,
      },
      closedOnClickOrEscape: false,
    });
    postListSpy.getCurrentCategory.and.returnValue(testValues.categoryID);

    await TestBed.configureTestingModule({
      imports: [NewPostButtonComponent],
      providers: [
        { provide: ModalService, useValue: modalSpy },
        { provide: PostListService, useValue: postListSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NewPostButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open modal if clicked and call createPost with the results', async () => {
    const buttonElement: HTMLButtonElement =
      fixture.debugElement.nativeElement.querySelector('button');
    buttonElement.click();
    await fixture.whenStable();

    expect(modalSpy.open).toHaveBeenCalled();
    expect(postListSpy.createPost).toHaveBeenCalledWith(
      testValues.title,
      testValues.body,
      testValues.files,
      testValues.categoryID
    );
  });
});
