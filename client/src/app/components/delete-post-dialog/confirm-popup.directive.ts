import {
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';
import { DeletePostDialogComponent } from './delete-post-dialog.component';
import { ModalService } from 'ngx-modal-ease';

@Directive({
  selector: '[appConfirmPopup]',
  standalone: true,
})
export class ConfirmPopupDirective {
  constructor(
    private modalService: ModalService,
    private elementRef: ElementRef
  ) {}

  @Input() confirmPosition: 'left' | 'right' | 'bottom' = 'left';
  @Output('appConfirmPopup') onConfirm = new EventEmitter<void>();

  @HostListener('click')
  async open(): Promise<void> {
    const popupWidth = 240;
    const popupHeight = 112;

    const { top, left, width, height } =
      this.elementRef.nativeElement.getBoundingClientRect();

    let modalTop = '';
    if (this.confirmPosition === 'bottom')
      modalTop = top + height + 10 + popupHeight / 2 + window.scrollY + 'px';
    else modalTop = top + height / 2 + window.scrollY + 'px';
    let modalLeft = '';
    if (this.confirmPosition === 'left')
      modalLeft = left - popupWidth / 2 - 10 + 'px';
    if (this.confirmPosition === 'right')
      modalLeft = left + width + popupWidth / 2 + 10 + 'px';
    if (this.confirmPosition === 'bottom') modalLeft = left + width / 2 + 'px';

    const response = await this.modalService.open(DeletePostDialogComponent, {
      overlay: {
        backgroundColor: 'transparent',
      },
      size: {
        width: popupWidth + 'px',
        height:
          this.confirmPosition === 'bottom' ? popupHeight + 'px' : undefined,
        padding: '0',
      },
      modal: {
        top: modalTop,
        left: modalLeft,
        enter:
          'delete-dialog-enter 0.2s cubic-bezier(0.165, 0.840, 0.440, 1.000)',
        leave: 'fade-out 0.2s ease',
      },
      data: {
        position: this.confirmPosition,
      },
    });

    if (response.data) this.onConfirm.emit();
  }
}
