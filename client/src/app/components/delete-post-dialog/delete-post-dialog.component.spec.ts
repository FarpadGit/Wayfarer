import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeletePostDialogComponent } from './delete-post-dialog.component';
import { ModalService } from 'ngx-modal-ease';

describe('DeletePostDialogComponent', () => {
  let component: DeletePostDialogComponent;
  let fixture: ComponentFixture<DeletePostDialogComponent>;
  let modalSpy: jasmine.SpyObj<ModalService>;
  let rootDiv: HTMLDivElement;

  beforeEach(async () => {
    modalSpy = jasmine.createSpyObj('ModalService', ['close']);

    await TestBed.configureTestingModule({
      imports: [DeletePostDialogComponent],
      providers: [{ provide: ModalService, useValue: modalSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(DeletePostDialogComponent);
    component = fixture.componentInstance;
    rootDiv =
      fixture.debugElement.nativeElement.querySelector('.delete-dialog');

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should close modal with "true" response if confirm button is pressed', () => {
    const confirmButton = rootDiv.querySelectorAll('button')[1];
    confirmButton.click();
    fixture.detectChanges();

    expect(modalSpy.close).toHaveBeenCalledWith(true);
  });

  it('should close modal with "false" response if cancel button is pressed', () => {
    const cancelButton = rootDiv.querySelectorAll('button')[0];
    cancelButton.click();
    fixture.detectChanges();

    expect(modalSpy.close).toHaveBeenCalledWith(false);
  });
});
