import { TestBed } from '@angular/core/testing';
import { NavigationStart, Router, RouterEvent } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

import { AnimationService, bgStates } from './animation.service';

describe('AnimationService', () => {
  let service: AnimationService;
  let routerSpy: jasmine.SpyObj<Router>;
  let routerEvents: BehaviorSubject<RouterEvent | null>;

  beforeEach(() => {
    routerEvents = new BehaviorSubject<RouterEvent | null>(null);
    routerSpy = jasmine.createSpyObj('Router', [], {
      events: routerEvents,
    });
    TestBed.configureTestingModule({
      providers: [{ provide: Router, useValue: routerSpy }],
    });

    service = TestBed.inject(AnimationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should change to "collapsing" state', async () => {
    expect(service.bgAnimationState).toBe(bgStates.none);

    service.startCollapseAnimation();

    expect(service.bgAnimationState).toBe(bgStates.collapsing);
  });

  it('should change to "entering" state', async () => {
    expect(service.bgAnimationState).toBe(bgStates.none);

    service.startEnterAnimation();

    expect(service.bgAnimationState).toBe(bgStates.entering);
  });

  it('should change to "entered" state', async () => {
    expect(service.bgAnimationState).toBe(bgStates.none);

    service.startEnterAnimation();
    service.endAnimation();

    expect(service.bgAnimationState).toBe(bgStates.entered);
  });

  it('should change to "exiting" state', async () => {
    expect(service.bgAnimationState).toBe(bgStates.none);

    service.startExitAnimation();

    expect(service.bgAnimationState).toBe(bgStates.exiting);
  });

  it('should change to "none" state', async () => {
    service.startExitAnimation();

    expect(service.bgAnimationState).toBe(bgStates.exiting);

    service.endAnimation();

    expect(service.bgAnimationState).toBe(bgStates.none);
  });

  it('should change states automatically on router NavigationStart event (enter)', () => {
    service.startEnterAnimation();
    routerEvents.next(new NavigationStart(0, ''));

    expect(service.bgAnimationState).toBe(bgStates.entered);
  });

  it('should change states automatically on router NavigationStart event (exit)', () => {
    service.startExitAnimation();
    routerEvents.next(new NavigationStart(0, ''));

    expect(service.bgAnimationState).toBe(bgStates.none);
  });
});
