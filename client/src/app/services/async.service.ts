import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AsyncService {
  constructor() {}

  public asAsync<T>(func: (...args: any[]) => Promise<any>) {
    const { execute, ...state } = this.asAsyncInternal<T>(func, true);
    execute();

    return state;
  }

  public asAsyncFn<T>(func: (...args: any[]) => Promise<any>) {
    return this.asAsyncInternal<T>(func, false);
  }

  private asAsyncInternal<T>(
    func: (...args: any[]) => Promise<any>,
    initialLoading: boolean = false
  ) {
    const loading = new BehaviorSubject<boolean>(initialLoading);
    const error = new BehaviorSubject<any>(null);
    const value = new BehaviorSubject<T | null>(null);
    const execute = (...params: any[]) => {
      loading.next(true);
      return func(...params)
        .then((data: any) => {
          value.next(data);
          error.next(undefined);
          return data;
        })
        .catch((err: any) => {
          error.next(err);
          value.next(null);
          return Promise.reject(err);
        })
        .finally(() => {
          loading.next(false);
        });
    };

    return { loading, error, value, execute };
  }
}
