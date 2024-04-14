import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [],
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.scss',
})
export class LoaderComponent {
  @Input() text: string = 'loading';
  @Input() inverted: boolean = false;

  get isInvertedStyle() {
    return this.inverted ? { '--loader-inverted': 1 } : undefined;
  }
}
