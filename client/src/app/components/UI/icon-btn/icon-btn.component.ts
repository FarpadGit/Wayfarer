import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';

type variants =
  | 'red'
  | 'orange'
  | 'white'
  | 'black'
  | 'large'
  | 'responsive-large'
  | 'vertical'
  | 'unpadded';

@Component({
  selector: 'app-icon-btn',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './icon-btn.component.html',
  styleUrl: './icon-btn.component.scss',
})
export class IconBtnComponent {
  @Input() variant: variants[] = [];
  @Input() isActive: boolean = false;
  @Input() loading: boolean = false;
  @Input() disabled: boolean = false;
  @Input() spinnerSize: 'medium' | 'large' = 'medium';
  @Input() ariaLabel: string = '';
  @Output() onClick = new EventEmitter<void>();
  @ViewChild('text') text!: HTMLDivElement;

  get iconClasses() {
    return this.variant.map((v) => {
      switch (v) {
        case 'white':
          return 'btn-white';
        case 'red':
          return 'btn-red';
        case 'orange':
          return 'btn-orange';
        case 'black':
          return 'btn-black';
        case 'large':
          return 'btn-large';
        case 'responsive-large':
          return 'btn-res-large';
        case 'vertical':
          return 'btn-vertical';
        case 'unpadded':
          return 'btn-p-0';
        default:
          throw v satisfies never;
      }
    });
  }

  get classes() {
    return `btn icon-btn ${this.isActive ? 'icon-btn-active' : ''} ${this.spinnerSize === 'large' ? 'spinner-large' : ''} ${this.iconClasses.join(' ')}`;
  }
}
