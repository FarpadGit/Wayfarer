import { inject, Injectable } from '@angular/core';
import { put as BlobPut } from '@vercel/blob';
import { LoginService, userAccounts } from '../login.service';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class ImagesApiService extends ApiService {
  private loginService: LoginService = inject(LoginService);

  async deleteImages(imageName: string) {
    return this.makeRequest('/images', {
      method: 'DELETE',
      data: { imageName },
    });
  }

  async uploadToBlobStorage(name: string, body: any) {
    return await BlobPut(name, body, {
      access: 'public',
      multipart: true,
      token: import.meta.env['NG_APP_BLOB_READ_WRITE_TOKEN'],
    });
  }

  async uploadImages(images: File[], postId: string, userId: string) {
    let blobFiles: { url: string; name: string }[] = [];

    for (let i = 0; i < images.length; i++) {
      const name = crypto.randomUUID() + '_' + images[i].name;
      const blobResponse = await this.uploadToBlobStorage(name, images[i]);
      blobFiles.push({ url: blobResponse.url, name });
    }

    return this.makeRequest('/images', {
      method: 'POST',
      data: {
        files: blobFiles,
        uploaderId: userId,
        uploaderName: this.loginService.currentUserName,
        postId,
        temporary:
          this.loginService.currentUserEmail === userAccounts.GUEST.email,
      },
    });
  }
}
