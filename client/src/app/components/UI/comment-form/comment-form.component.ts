import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-comment-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './comment-form.component.html',
  styleUrl: './comment-form.component.scss',
})
export class CommentFormComponent {
  @Input() loading = false;
  @Input() error? = '';
  @Input() autoFocus = false;
  @Input('initialValue') message = '';
  @Output() onSubmit = new EventEmitter<string>();
  @ViewChild('textArea') set textAreaRef(ref: ElementRef) {
    if (ref) {
      ref.nativeElement.focus();
    }
  }

  handleSubmit() {
    this.onSubmit.emit(this.message);
    this.message = '';
  }
}
