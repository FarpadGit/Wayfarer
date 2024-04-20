import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService } from 'ngx-modal-ease';

@Component({
  selector: 'app-delete-post-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delete-post-dialog.component.html',
  styleUrl: './delete-post-dialog.component.scss',
})
export class DeletePostDialogComponent {
  constructor(private modalService: ModalService) {}
  @Input() position: 'left' | 'right' = 'left';

  onConfirm() {
    this.modalService.close(true);
  }

  onCancel() {
    this.modalService.close(false);
  }
}
