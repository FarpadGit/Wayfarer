import { computed, Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AsyncService {
  public asAsyncFn<T>(func: (...args: any[]) => Promise<any>) {
    return this.asAsyncInternal<T>(func, false);
  }

  private asAsyncInternal<T>(
    func: (...args: any[]) => Promise<any>,
    initialLoading: boolean = false
  ) {
    const _loading = signal<boolean>(initialLoading);
    const loading = computed(() => _loading());
    const _error = signal<any>(null);
    const error = computed(() => _error());
    const _value = signal<T | null>(null);
    const value = computed(() => _value());
    const execute = async (...params: any[]) => {
      _loading.set(true);
      return func(...params)
        .then((data: T) => {
          _value.set(data);
          _error.set(undefined);
          return data;
        })
        .catch((err: any) => {
          _error.set(err);
          _value.set(null);
          return Promise.reject(err);
        })
        .finally(() => {
          _loading.set(false);
        });
    };

    return { loading, error, value, execute };
  }
}
