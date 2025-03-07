import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-comment-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './comment-form.component.html',
  styleUrl: './comment-form.component.scss',
})
export class CommentFormComponent {
  @Input() autoFocus = false;
  @Input() set initialValue(value: string) {
    this.message = value;
    this._initialValue = value;
  }

  @Output() onSubmit = new EventEmitter<string>();
  @Output() onEscape = new EventEmitter<void>();
  @ViewChild('textArea') set textAreaRef(ref: ElementRef) {
    if (ref && this.autoFocus) {
      ref.nativeElement.focus();
    }
  }

  message = '';
  _initialValue = '';

  onKeyDown(e: KeyboardEvent) {
    if (e.key.toLowerCase() === 'escape') this.onEscape.emit();
  }

  handleSubmit() {
    this.onSubmit.emit(this.message);
    if (this._initialValue === '') this.message = '';
  }
}
