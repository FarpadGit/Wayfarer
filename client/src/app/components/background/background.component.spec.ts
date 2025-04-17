import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { BackgroundComponent } from './background.component';
import {
  navStates,
  TransitionService,
} from '../../services/transition.service';
import { AnimationService, bgStates } from '../../services/animation.service';
import { setSpyProperty } from '../../../test/test.utils';

describe('BackgroundComponent', () => {
  class mockAnimationServiceClass {
    state = signal(bgStates.none);
    get bgAnimationState() {
      return this.state();
    }
  }

  let component: BackgroundComponent;
  let fixture: ComponentFixture<BackgroundComponent>;
  let transitionSpy: jasmine.SpyObj<TransitionService>;
  let mockAnimationService: mockAnimationServiceClass;
  let rootDiv: HTMLDivElement;

  beforeEach(async () => {
    transitionSpy = jasmine.createSpyObj(
      'TransitionService',
      ['readyToNavigate', 'callDelayedNavigate'],
      {
        navigationState: navStates.none,
        currentUrl: '',
      }
    );

    mockAnimationService = new mockAnimationServiceClass();

    await TestBed.configureTestingModule({
      imports: [BackgroundComponent],
      providers: [
        provideNoopAnimations(),
        { provide: TransitionService, useValue: transitionSpy },
        { provide: AnimationService, useValue: mockAnimationService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BackgroundComponent);
    component = fixture.componentInstance;
    rootDiv =
      fixture.debugElement.nativeElement.querySelector('.background-image');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not be blurred when idle', () => {
    expect(component.animationState).toBe(bgStates.none);
    expect(component.blur).toBeFalse();
  });

  it('should expand to full screen when animation is entering, then blur', async () => {
    mockAnimationService.state.set(bgStates.entering);
    fixture.detectChanges();

    expect(component.animationState).toBe(bgStates.entering);
    expect(component.blur).toBeFalse();

    await fixture.whenStable();

    expect(component.blur).toBeTrue();
    expect(transitionSpy.callDelayedNavigate).toHaveBeenCalled();
    expect(rootDiv.style.position).toBe('fixed');
    expect(rootDiv.style.height).toBe('100vh');
    expect(rootDiv.style.width).toBe('100vw');
  });

  it('should be full screen and not blurred on posts page', () => {
    setSpyProperty(transitionSpy, 'currentUrl', '/posts/123');
    fixture.detectChanges();
    const {
      width: bgWidth,
      height: bgHeight,
      position: bgPosition,
    } = getComputedStyle(rootDiv);

    expect(bgWidth).toBe(window.innerWidth + 'px');
    expect(bgHeight).toBe(window.innerHeight + 'px');
    expect(bgPosition).toBe('fixed');
    expect(component.blur).toBeFalse();
  });

  it('should be blurred when animation is exiting', () => {
    mockAnimationService.state.set(bgStates.exiting);
    fixture.detectChanges();

    expect(component.animationState).toBe(bgStates.exiting);
    expect(component.blur).toBeTrue();
  });
});
