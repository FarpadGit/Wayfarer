import { TestBed } from '@angular/core/testing';

import { ImagesApiService } from './images.api.service';
import { LoginService, userAccounts } from '../login.service';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

describe('ImagesApiService', () => {
  let service: ImagesApiService;
  let loginSpy: jasmine.SpyObj<LoginService>;
  let mockAxios: MockAdapter;

  beforeAll(() => {
    mockAxios = new MockAdapter(axios);
  });

  beforeEach(() => {
    mockAxios
      .onPost(import.meta.env['NG_APP_IMAGE_SERVER_URL'], {
        asymmetricMatch: () => ({
          origin: 'WF',
          ac: jasmine.any(String),
        }),
      })
      .reply(200, 'post endpoint called')
      .onDelete(import.meta.env['NG_APP_IMAGE_SERVER_URL'], {
        data: {
          asymmetricMatch: () => ({
            origin: 'WF',
            ac: jasmine.any(String),
          }),
        },
      })
      .reply(204, 'delete endpoint called');

    loginSpy = jasmine.createSpyObj('LoginService', [], {
      currentUserEmail: userAccounts.GUEST.email,
    });

    TestBed.configureTestingModule({
      providers: [{ provide: LoginService, useValue: loginSpy }],
    });

    service = TestBed.inject(ImagesApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should upload images to the image backend', async () => {
    const result = await service.uploadImages(
      [
        { name: 'fakeImage1.jpg', src: 'fakeBase64String1' },
        { name: 'fakeImage2.jpg', src: 'fakeBase64String2' },
      ],
      'fakePostID',
      'fakeUserID'
    );

    expect(result).toBe('post endpoint called');
  });

  it('should delete images from the image backend', async () => {
    const result = await service.deleteImages(['fakeImage1ID', 'fakeImage2ID']);

    expect(result).toBe('delete endpoint called');
  });
});
