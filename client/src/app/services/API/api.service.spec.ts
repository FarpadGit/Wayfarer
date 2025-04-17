import { TestBed } from '@angular/core/testing';

import { ApiService } from './api.service';
import { AsyncService } from './async.service';
import { mockUser } from '../../../test/mocks';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

describe('ApiService', () => {
  let service: ApiService;
  let mockAxios: MockAdapter;

  beforeAll(() => {
    mockAxios = new MockAdapter(axios);
  });

  beforeEach(() => {
    mockAxios
      .onPost('/login', {
        asymmetricMatch: () => ({
          userToken: {
            email: jasmine.any(String),
            name: jasmine.any(String),
          },
        }),
      })
      .reply(200, true);

    TestBed.configureTestingModule({
      providers: [{ provide: AsyncService, useValue: {} }],
    });

    service = TestBed.inject(ApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should be able to authenticate user', async () => {
    const response = await service.validateUser({
      email: mockUser.email,
      display: mockUser.name,
    });

    expect(response).toBeTrue();
  });
});
