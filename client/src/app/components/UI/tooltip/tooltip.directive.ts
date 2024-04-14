import {
  ApplicationRef,
  ComponentRef,
  Directive,
  ElementRef,
  HostListener,
  Input,
  OnDestroy,
  ViewContainerRef,
} from '@angular/core';
import { TooltipComponent } from './tooltip.component';

@Directive({
  selector: '[appTooltip]',
  standalone: true,
})
export class TooltipDirective implements OnDestroy {
  @Input('appTooltip') tooltip = '';

  private componentRef: ComponentRef<any> | null = null;

  constructor(
    private elementRef: ElementRef,
    private appRef: ApplicationRef,
    private viewContainerRef: ViewContainerRef
  ) {}

  @HostListener('mouseenter')
  onMouseEnter(): void {
    if (this.componentRef === null) {
      this.componentRef =
        this.viewContainerRef.createComponent(TooltipComponent);

      if (this.componentRef !== null) {
        this.componentRef.instance.tooltip = this.tooltip;
        const { left, right, bottom } =
          this.elementRef.nativeElement.getBoundingClientRect();
        this.componentRef.instance.left = (right - left) / 2 + left;
        this.componentRef.instance.top = bottom;
      }
    }
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    this.destroy();
  }

  ngOnDestroy(): void {
    this.destroy();
  }

  destroy(): void {
    if (this.componentRef !== null) {
      this.appRef.detachView(this.componentRef.hostView);
      this.componentRef.destroy();
      this.componentRef = null;
    }
  }
}
