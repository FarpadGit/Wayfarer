import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { isSignal } from '@angular/core';

import { AsyncService } from './async.service';

describe('AsyncService', () => {
  let service: AsyncService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [],
    });

    service = TestBed.inject(AsyncService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return an object with "loading", "error", "value" signals and an "execute" function', () => {
    const testFunction = () => Promise.resolve(() => 'Test function executed');
    const response = service.asAsync(testFunction);

    expect(response).toEqual({
      loading: jasmine.any(Function),
      error: jasmine.any(Function),
      value: jasmine.any(Function),
      execute: jasmine.any(Function),
    });
    expect(isSignal(response.loading)).toBeTrue();
    expect(isSignal(response.error)).toBeTrue();
    expect(isSignal(response.value)).toBeTrue();
    expect(response.loading()).toBeFalse();
    expect(response.error()).toBeNull();
    expect(response.value()).toBeNull();
  });

  it('should update "loading" signal if "execute" function started and again once it finished', fakeAsync(() => {
    const testFunction = () =>
      new Promise((resolve) =>
        setTimeout(() => resolve('Test function executed'), 200)
      );
    const response = service.asAsync(testFunction);

    response.execute();
    tick(100);

    expect(response.loading()).toBeTrue();
    expect(response.value()).toBeNull();

    tick(100);
    expect(response.loading()).toBeFalse();
    expect(response.value()).toBe('Test function executed');
  }));

  it('should update "value" signal if "execute" function is executed', async () => {
    const testFunction = () => Promise.resolve('Test function executed');
    const response = service.asAsync(testFunction);

    await response.execute();

    expect(response.value()).toBe('Test function executed');
    expect(response.error()).toBeUndefined();
  });

  it('should update "error" signal if "execute" function is executed with an error', async () => {
    const testFunction = () => Promise.reject('Test function failed');
    const response = service.asAsync(testFunction);

    await response.execute().catch(() => {
      expect(response.error()).toBe('Test function failed');
      expect(response.value()).toBeNull();
    });
  });
});
