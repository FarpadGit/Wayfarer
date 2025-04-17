import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TooltipComponent } from './tooltip.component';

describe('TooltipComponent', () => {
  let component: TooltipComponent;
  let fixture: ComponentFixture<TooltipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TooltipComponent],
      providers: [],
    }).compileComponents();

    fixture = TestBed.createComponent(TooltipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display tooltip text', () => {
    const testText = 'Test Tooltip Text';
    component.tooltip = testText;
    fixture.detectChanges();
    const rootDiv: HTMLDivElement =
      fixture.debugElement.nativeElement.querySelector('.tooltip');

    expect(rootDiv.textContent?.includes(testText)).toBeTrue();
  });
});
