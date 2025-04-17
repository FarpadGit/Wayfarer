import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmPopupDirective } from './confirm-popup.directive';
import { ModalService } from 'ngx-modal-ease';

describe('ConfirmPopupDirective', () => {
  @Component({
    selector: 'test-component',
    standalone: true,
    imports: [ConfirmPopupDirective],
    template: `
      <button
        (appConfirmPopup)="result = true"
        [confirmPosition]="popupPos"
      ></button>
    `,
  })
  class TestComponent {
    @Input() popupPos: 'left' | 'right' | 'bottom' = 'left';
    result?: boolean;
  }

  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;
  let modalSpy: jasmine.SpyObj<ModalService>;

  beforeEach(async () => {
    modalSpy = jasmine.createSpyObj('ModalService', ['open']);
    modalSpy.open.and.resolveTo({ data: true, closedOnClickOrEscape: false });

    await TestBed.configureTestingModule({
      imports: [TestComponent, ConfirmPopupDirective],
      providers: [{ provide: ModalService, useValue: modalSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create an instance', () => {
    const directive = new ConfirmPopupDirective(modalSpy, fixture.elementRef);

    expect(directive).toBeTruthy();
  });

  it('should open modal when host button is clicked', () => {
    const TestButtonElement = fixture.debugElement.nativeElement.querySelector(
      'button'
    ) as HTMLButtonElement;
    TestButtonElement.click();
    fixture.detectChanges();

    expect(modalSpy.open).toHaveBeenCalled();
  });
  it('should emit user response when user confirms popup', async () => {
    const TestButtonElement = fixture.debugElement.nativeElement.querySelector(
      'button'
    ) as HTMLButtonElement;
    TestButtonElement.click();
    fixture.detectChanges();

    const confirmDialogElement = document.querySelector('.delete-dialog');
    const confirmButton = confirmDialogElement?.querySelectorAll('button')[1];
    confirmButton?.click();
    await fixture.whenStable();

    expect(component.result).toBeTrue();
  });

  it('should not emit anything when user cancels popup', async () => {
    modalSpy.open.and.resolveTo({ data: false, closedOnClickOrEscape: false });
    const TestButtonElement = fixture.debugElement.nativeElement.querySelector(
      'button'
    ) as HTMLButtonElement;
    TestButtonElement.click();
    fixture.detectChanges();

    const confirmDialogElement = document.querySelector('.delete-dialog');
    const cancelButton = confirmDialogElement?.querySelectorAll('button')[0];
    cancelButton?.click();
    await fixture.whenStable();

    expect(component.result).toBeUndefined();
  });
});
