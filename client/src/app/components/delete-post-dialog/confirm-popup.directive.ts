import {
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  Output,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { DeletePostDialogComponent } from './delete-post-dialog.component';
import { ModalService } from 'ngx-modal-ease';

@Directive({
  selector: '[appConfirmPopup]',
  standalone: true,
})
export class ConfirmPopupDirective implements OnDestroy {
  constructor(
    private modalService: ModalService,
    private elementRef: ElementRef
  ) {}

  private dialogSub: Subscription | null = null;
  @Input() confirmPosition: 'left' | 'right' = 'left';
  @Input() confirmPosition: 'left' | 'right' | 'bottom' = 'left';
  @Output('appConfirmPopup') onConfirm = new EventEmitter<void>();

  ngOnDestroy(): void {
    this.dialogSub?.unsubscribe();
  }

  @HostListener('click')
  open(): void {
    const popupWidth = 240;

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

    this.dialogSub = this.modalService
      .open(DeletePostDialogComponent, {
        overlay: {
          backgroundColor: 'transparent',
        },
        size: {
          width: popupWidth + 'px',
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
      })
      .subscribe((response: boolean | undefined) => {
        if (response) {
          this.onConfirm.emit();
        }
      });
  }
}
