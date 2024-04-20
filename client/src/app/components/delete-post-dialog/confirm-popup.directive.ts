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
    private elementRef: ElementRef,
    private modalService: ModalService
  ) {}

  private dialogSub: Subscription | null = null;
  @Input() confirmPosition: 'left' | 'right' = 'left';
  @Output('appConfirmPopup') onConfirm = new EventEmitter<void>();

  ngOnDestroy(): void {
    this.dialogSub?.unsubscribe();
  }

  @HostListener('click')
  open(): void {
    const popupWidth = 240;

    const { top, left, width, height } =
      this.elementRef.nativeElement.getBoundingClientRect();

    const modalTop = top + height / 2 + 'px';
    const modalLeft =
      this.confirmPosition === 'left'
        ? left - popupWidth / 2 - 10 + 'px'
        : left + width + popupWidth / 2 + 10 + 'px';

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
        },
        data: {
          position: this.confirmPosition,
        },
      })
      .subscribe((response: boolean | undefined) => {
        if (response) this.onConfirm.emit();
      });
  }
}
