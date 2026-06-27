import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BackgroundComponent } from './background.component';
import {
  navStates,
  TransitionService,
} from '../../services/transition.service';
import { AnimationService, bgStates } from '../../services/animation.service';
import { BehaviorSubject } from 'rxjs';

describe('BackgroundComponent', () => {
  class mockAnimationServiceClass {
    bgAnimationState = signal(bgStates.none);
    blur = signal(false);
  }

  let component: BackgroundComponent;
  let fixture: ComponentFixture<BackgroundComponent>;
  let transitionSpy: jasmine.SpyObj<TransitionService>;
  let mockAnimationService: mockAnimationServiceClass;
  let rootDiv: HTMLDivElement;
  let navigationStateSubject: BehaviorSubject<navStates>;

  beforeEach(async () => {
    navigationStateSubject = new BehaviorSubject(navStates.none as navStates);

    transitionSpy = jasmine.createSpyObj(
      'TransitionService',
      ['currentUrl', 'callDelayedNavigate', 'readyToNavigate'],
      {
        navigationState: navigationStateSubject,
      },
    );

    mockAnimationService = new mockAnimationServiceClass();

    transitionSpy.currentUrl.and.returnValue('');

    await TestBed.configureTestingModule({
      imports: [BackgroundComponent],
      providers: [
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

  it('should expand to full screen when animation is entering', async () => {
    mockAnimationService.bgAnimationState.set(bgStates.entering);
    fixture.detectChanges();
    await fixture.whenRenderingDone();
    await new Promise((res) => setTimeout(() => res(0), 1600));
    const { width: bgWidth, height: bgHeight } = getComputedStyle(rootDiv);
    const widthValue = Number.parseInt(bgWidth);
    const heightValue = Number.parseInt(bgHeight);

    expect(transitionSpy.callDelayedNavigate).toHaveBeenCalled();
    expect(widthValue).toBeGreaterThanOrEqual(window.innerWidth);
    expect(heightValue).toBeGreaterThanOrEqual(window.innerHeight);
  });

  it('should expand to full screen when animation is quick-entering', async () => {
    mockAnimationService.bgAnimationState.set(bgStates.quickEntering);
    fixture.detectChanges();
    await fixture.whenRenderingDone();
    const { width: bgWidth, height: bgHeight } = getComputedStyle(rootDiv);

    expect(bgWidth).toBe(window.innerWidth + 'px');
    expect(bgHeight).toBe(window.innerHeight + 'px');
  });

  it('should be full screen on posts page', async () => {
    transitionSpy.currentUrl.and.returnValue('/posts/123');
    fixture.detectChanges();
    await fixture.whenRenderingDone();
    const {
      width: bgWidth,
      height: bgHeight,
      position: bgPosition,
    } = getComputedStyle(rootDiv);

    expect(bgWidth).toBe(window.innerWidth + 'px');
    expect(bgHeight).toBe(window.innerHeight + 'px');
    expect(bgPosition).toBe('fixed');
  });

  it('should load a new background image if navigation state is "waiting"', () => {
    expect(component.backgroundImage).toBe('');

    navigationStateSubject.next(navStates.waiting);

    expect(component.backgroundImage).not.toBe('');
  });
});
