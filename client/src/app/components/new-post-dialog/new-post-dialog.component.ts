import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModalService } from 'ngx-modal-ease';

@Component({
  selector: 'app-new-post-dialog',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './new-post-dialog.component.html',
  styleUrl: './new-post-dialog.component.scss',
})
export class NewPostDialogComponent implements AfterViewInit {
  constructor(private modalService: ModalService) {}

  @ViewChild('titleInput') titleInput: ElementRef<HTMLInputElement> | null =
    null;

  newPost = { title: '', body: '' };

  ngAfterViewInit(): void {
    this.titleInput?.nativeElement.focus();
  }

  onSubmit() {
    this.modalService.close(this.newPost);
  }

  dismiss() {
    this.modalService.close(null);
  }
}
