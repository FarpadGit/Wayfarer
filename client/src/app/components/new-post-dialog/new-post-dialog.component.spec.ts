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

  it('should display input data in text fields', async () => {
    component.newPost = {
      title: 'Fake New Post',
      body: 'Lorem Ipsum',
    };
    fixture.detectChanges();
    await fixture.whenStable();
    const titleInputField = rootDiv.querySelector('input');
    const bodyInputField = rootDiv.querySelector('textarea');

    expect(titleInputField?.value).toBe(component.newPost.title);
    expect(bodyInputField?.value).toBe(component.newPost.body);
  });

  it('should submit entered data and close modal on submit button press', () => {
    component.newPost = {
      title: 'Fake New Post',
      body: 'Lorem Ipsum',
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
