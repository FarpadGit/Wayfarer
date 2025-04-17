import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Router } from '@angular/router';

import { navStates, TransitionService } from './transition.service';

describe('TransitionService', () => {
  let service: TransitionService;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl'], {
      url: '',
    });

    TestBed.configureTestingModule({
      providers: [{ provide: Router, useValue: routerSpy }],
    });

    service = TestBed.inject(TransitionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should change to "waiting" state if navigation request was called while not in "ready" state', () => {
    expect(service.navigationState).not.toBe(navStates.ready);

    service.callNavigate();

    expect(service.navigationState).toBe(navStates.waiting);
  });

  it('should change to "ready" state', () => {
    service.readyToNavigate();

    expect(service.navigationState).toBe(navStates.ready);
  });

  describe('callNavigate', () => {
    const testUrl = '/posts/fakeId';

    it('should start router navigation if request was called while in "ready" state', () => {
      service.readyToNavigate();
      service.callNavigate();

      expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('');
    });

    it('should start router navigation to URL if request was called while in "ready" state', () => {
      service.readyToNavigate();
      service.callNavigate(testUrl);

      expect(routerSpy.navigateByUrl).toHaveBeenCalledWith(testUrl);
    });

    it('should start router navigation if request was called with "force" flag', () => {
      expect(service.navigationState).not.toBe(navStates.ready);

      service.callNavigate(testUrl, true);

      expect(routerSpy.navigateByUrl).toHaveBeenCalledWith(testUrl);
    });

    it('should start router navigation if "waiting" state changed to "ready" state', () => {
      service.callNavigate(testUrl);
      service.readyToNavigate();

      expect(routerSpy.navigateByUrl).toHaveBeenCalledWith(testUrl);
    });

    it('should send navigation request with a delay', fakeAsync(() => {
      service.callDelayedNavigate(200, testUrl, true);
      tick(200);

      expect(routerSpy.navigateByUrl).toHaveBeenCalledWith(testUrl);
    }));

    afterEach(() => {
      expect(service.navigationState).toBe(navStates.none);
      expect(service.blur).toBeFalse();
    });
  });
});
