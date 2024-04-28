import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-icon-btn',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './icon-btn.component.html',
  styleUrl: './icon-btn.component.scss',
})
export class IconBtnComponent {
  @Input() iconClass: string = '';
  @Input() isActive: boolean = false;
  @Input() loading: boolean = false;
  @Input() disabled: boolean = false;
  @Input() ariaLabel: string = '';
  @Output() onClick = new EventEmitter<null>();
  @ViewChild('text') text!: HTMLDivElement;

  get classes() {
    return `btn icon-btn ${this.isActive ? 'icon-btn-active' : ''} ${
      this.iconClass
    }`;
  }
}
