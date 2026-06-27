import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Router } from '@angular/router';

import { navStates, TransitionService } from './transition.service';
import { of, Subscription } from 'rxjs';

describe('TransitionService', () => {
  let service: TransitionService;
  let routerSpy: jasmine.SpyObj<Router>;
  let navigationState: navStates;
  let navSub: Subscription;

  beforeEach(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl'], {
      events: of([]),
    });

    TestBed.configureTestingModule({
      providers: [{ provide: Router, useValue: routerSpy }],
    });

    service = TestBed.inject(TransitionService);
    navSub = service.navigationState.subscribe((navState) => {
      navigationState = navState;
    });
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should change to "waiting" state if navigation request was called while not in "ready" state', () => {
    expect(navigationState).not.toBe(navStates.ready);

    service.callNavigate();

    expect(navigationState).toBe(navStates.waiting);
  });

  it('should change to "ready" state', () => {
    service.readyToNavigate();

    expect(navigationState).toBe(navStates.ready);
  });

  describe('callNavigate', () => {
    const testUrl = '/posts/fakeId';

    it('should start router navigation if request was called while in "ready" state', () => {
      service.readyToNavigate();
      service.callNavigate();

      expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('');
      expect(navigationState).toBe(navStates.none);
    });

    it('should start router navigation to URL if request was called while in "ready" state', () => {
      service.readyToNavigate();
      service.callNavigate(testUrl);

      expect(routerSpy.navigateByUrl).toHaveBeenCalledWith(testUrl);
      expect(navigationState).toBe(navStates.none);
    });

    it('should start router navigation if request was called with "force" flag', () => {
      expect(navigationState).not.toBe(navStates.ready);

      service.callNavigate(testUrl, true);

      expect(routerSpy.navigateByUrl).toHaveBeenCalledWith(testUrl);
      expect(navigationState).toBe(navStates.none);
    });

    it('should start router navigation if "waiting" state changed to "ready" state', () => {
      service.callNavigate(testUrl);
      service.readyToNavigate();

      expect(routerSpy.navigateByUrl).toHaveBeenCalledWith(testUrl);
      expect(navigationState).toBe(navStates.none);
    });

    it('should send navigation request with a delay', fakeAsync(() => {
      service.callDelayedNavigate(200, testUrl, true);
      tick(200);

      expect(routerSpy.navigateByUrl).toHaveBeenCalledWith(testUrl);
      expect(navigationState).toBe(navStates.none);
    }));
  });

  afterEach(() => {
    navSub.unsubscribe();
  });
});
