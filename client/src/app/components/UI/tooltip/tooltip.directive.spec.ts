import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TooltipDirective } from './tooltip.directive';

describe('TooltipDirective', () => {
  @Component({
    selector: 'test-component',
    standalone: true,
    imports: [TooltipDirective],
    template: ` <div test [appTooltip]="tooltipText"></div> `,
  })
  class TestComponent {
    @Input() tooltipText = '';
  }

  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestComponent, TooltipDirective],
      providers: [],
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create tooltip component on mouseenter and remove it on mouseleave', async () => {
    const testText = 'Mouse Enter Detected';

    component.tooltipText = testText;
    fixture.detectChanges();
    const testElement: HTMLDivElement =
      fixture.debugElement.nativeElement.querySelector('[test]');
    testElement.dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();
    await fixture.whenStable();

    let tooltipElement = document.querySelector('.tooltip');
    expect(tooltipElement).toBeTruthy();
    expect(tooltipElement?.textContent?.includes(testText)).toBeTrue();

    testElement.dispatchEvent(new MouseEvent('mouseleave'));
    fixture.detectChanges();
    await fixture.whenStable();

    tooltipElement = document.querySelector('.tooltip');
    expect(tooltipElement).toBeFalsy();
  });
});
