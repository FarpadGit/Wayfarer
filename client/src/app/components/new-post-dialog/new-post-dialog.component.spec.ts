import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewPostDialogComponent } from './new-post-dialog.component';
import { ModalService } from 'ngx-modal-ease';

describe('NewPostDialogComponent', () => {
  let component: NewPostDialogComponent;
  let fixture: ComponentFixture<NewPostDialogComponent>;
  let modalSpy: jasmine.SpyObj<ModalService>;
  let rootDiv: HTMLDivElement;

  beforeEach(async () => {
    modalSpy = jasmine.createSpyObj('ModalService', ['close']);

    await TestBed.configureTestingModule({
      imports: [NewPostDialogComponent],
      providers: [{ provide: ModalService, useValue: modalSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(NewPostDialogComponent);
    component = fixture.componentInstance;
    rootDiv =
      fixture.debugElement.nativeElement.querySelector('.new-post-dialog');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display input data in text fields as well as uploaded images', async () => {
    component.newPost = {
      title: 'Fake New Post',
      body: 'Lorem Ipsum',
      images: [
        { name: 'fakeImg1.jpg', url: 'fakeBase64String1' },
        { name: 'fakeImg2.jpg', url: 'fakeBase64String2' },
      ],
    };
    fixture.detectChanges();
    await fixture.whenStable();
    const titleInputField = rootDiv.querySelector('input');
    const bodyInputField = rootDiv.querySelector('textarea');
    const imageBlocks = Array.from(rootDiv.querySelectorAll('.image-block'));

    expect(titleInputField?.value).toBe(component.newPost.title);
    expect(bodyInputField?.value).toBe(component.newPost.body);
    expect(imageBlocks.length).toBe(2);
    for (let i = 0; i < imageBlocks.length; i++) {
      const img = imageBlocks[i].querySelector('img');
      expect(img?.src.endsWith(component.newPost.images[i].url)).toBeTrue();
    }
  });

  it('should submit entered data and close modal on submit button press', () => {
    component.newPost = {
      title: 'Fake New Post',
      body: 'Lorem Ipsum',
      images: [],
    };
    const submitButton = rootDiv.querySelector(
      '[data-test-confirm-btn]'
    ) as HTMLButtonElement;
    submitButton.click();
    fixture.detectChanges();

    expect(modalSpy.close).toHaveBeenCalledWith(component.newPost);
  });

  it('should close modal on cancel button press', () => {
    const cancelButton = rootDiv.querySelector(
      '[data-test-cancel-btn]'
    ) as HTMLButtonElement;
    cancelButton.click();
    fixture.detectChanges();

    expect(modalSpy.close).toHaveBeenCalled();
  });
});
