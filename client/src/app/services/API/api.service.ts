import { Injectable } from '@angular/core';
import { AsyncService } from './async.service';
import axios, { AxiosRequestConfig } from 'axios';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(protected asyncService: AsyncService) {}

  private callAxios = axios.create({
    baseURL: import.meta.env['NG_APP_SERVER_URL'],
    withCredentials: true,
  });

  protected async makeRequest(url: string, options?: AxiosRequestConfig<any>) {
    return this.callAxios(url, options)
      .then((res) => res.data)
      .catch((error) =>
        Promise.reject(
          error?.response?.data?.message ??
            'Sajnos egy ismeretlen eredetű hiba lépett fel a szerverhez kapcsolódás közben.'
        )
      );
  }

  validateUser(user: { email: string; display: string }) {
    return this.makeRequest('/login', {
      method: 'POST',
      data: {
        userToken: {
          email: user.email,
          name: user.display,
        },
      },
    });
  }
}
