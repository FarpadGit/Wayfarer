import { TestBed } from '@angular/core/testing';

import { ImagesApiService } from './images.api.service';
import { LoginService, userAccounts } from '../login.service';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import * as VercelBlob from '@vercel/blob';

describe('ImagesApiService', () => {
  let service: ImagesApiService;
  let loginSpy: jasmine.SpyObj<LoginService>;
  let mockAxios: MockAdapter;

  beforeAll(() => {
    mockAxios = new MockAdapter(axios);
  });

  beforeEach(() => {
    mockAxios
      .onPost('/images', {
        asymmetricMatch: () => ({
          files: jasmine.any(Array<Object>),
          uploaderId: jasmine.any(String),
          uploaderName: jasmine.any(String),
          postId: jasmine.any(String),
          temporary: jasmine.any(Boolean),
        }),
      })
      .reply(200, 'post endpoint called')
      .onDelete('/images', {
        data: {
          asymmetricMatch: () => ({
            imageName: jasmine.any(String),
          }),
        },
      })
      .reply(204, 'delete endpoint called');

    loginSpy = jasmine.createSpyObj('LoginService', [], {
      currentUserName: userAccounts.GUEST.display,
      currentUserEmail: userAccounts.GUEST.email,
    });

    TestBed.configureTestingModule({
      providers: [{ provide: LoginService, useValue: loginSpy }],
    });

    service = TestBed.inject(ImagesApiService);

    spyOn(service, 'uploadToBlobStorage').and.resolveTo({
      url: 'fakeBlobUrl',
    } as VercelBlob.PutBlobResult);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should upload images to Vercel Blob and notify the backend', async () => {
    const result = await service.uploadImages(
      [new File([], 'fakeImage1.jpg'), new File([], 'fakeImage2.jpg')],
      'fakePostID',
      'fakeUserID'
    );

    expect(result).toBe('post endpoint called');
  });

  it('should notify the backend to delete images', async () => {
    const result = await service.deleteImages('fakeImage1.jpg');

    expect(result).toBe('delete endpoint called');
  });
});
