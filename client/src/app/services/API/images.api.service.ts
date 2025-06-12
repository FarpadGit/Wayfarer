import { Injectable } from '@angular/core';
import axios, { AxiosRequestConfig } from 'axios';
import { put as BlobPut } from '@vercel/blob';
import { LoginService, userAccounts } from '../login.service';

@Injectable({
  providedIn: 'root',
})
export class ImagesApiService {
  constructor(private loginService: LoginService) {}

  private async postImages(options?: AxiosRequestConfig<any>) {
    return axios
      .request({
        url: import.meta.env['NG_APP_IMAGE_SERVER_URL'],
        ...options,
      })
      .then((res) => res.data)
      .catch((error) =>
        Promise.reject(
          error?.response?.data?.message ??
            'Sajnos egy ismeretlen eredetű hiba lépett fel a képfeltöltő szerverhez kapcsolódás közben.'
        )
      );
  }

  async deleteImages(imageIds: string[]) {
    const payload = {
      img_names: imageIds,
    };

    return this.postImages({
      method: 'DELETE',
      data: {
        origin: 'WF',
        ac: await this.AESEncode(JSON.stringify(payload)),
      },
    });
  }

  async uploadImages(images: File[], postId: string, userId: string) {
    let blobFiles: { url: string; name: string }[] = [];

    for (let i = 0; i < images.length; i++) {
      const name = crypto.randomUUID() + '_' + images[i].name;
      const blobResponse = await BlobPut(name, images[i], {
        access: 'public',
        multipart: true,
        token: import.meta.env['NG_APP_BLOB_READ_WRITE_TOKEN'],
      });
      blobFiles.push({ url: blobResponse.url, name });
    }

    const payload = {
      files: blobFiles,
      uploader_id: userId,
      uploader_name: this.loginService.currentUserName,
      post_id: postId,
      temporary:
        this.loginService.currentUserEmail === userAccounts.GUEST.email,
    };

    const encryptedPayload = await this.AESEncode(JSON.stringify(payload));

    return this.postImages({
      method: 'POST',
      data: {
        origin: 'WF',
        ac: encryptedPayload,
      },
    });
  }

  private async AESEncode(data: string) {
    const secretKey: string = import.meta.env['NG_APP_IMAGE_SERVER_AES_KEY'];
    const binaryData = new TextEncoder().encode(data);

    const iv = window.crypto.getRandomValues(new Uint8Array(16));
    const cryptoKey = await window.crypto.subtle.importKey(
      'raw',
      this.str2ab(secretKey),
      { name: 'AES-CBC' },
      false,
      ['encrypt']
    );

    const ctEncrypted = await window.crypto.subtle.encrypt(
      { name: 'AES-CBC', iv: iv },
      cryptoKey,
      binaryData
    );

    const ciphertext = btoa(this.ab2str(ctEncrypted));
    const ivString = btoa(String.fromCharCode(...iv));

    return btoa(JSON.stringify({ iv: ivString, ciphertext }));
  }

  // string to ArrayBuffer
  private str2ab(str: string) {
    const buffer = new ArrayBuffer(str.length);
    const binaryBuffer = new Uint8Array(buffer);
    for (let i = 0; i < str.length; i++) {
      binaryBuffer[i] = str.charCodeAt(i);
    }
    return buffer;
  }

  // ArrayBuffer to string
  private ab2str(ab: ArrayBuffer) {
    const binary = new Uint8Array(ab);
    const text = Array.from(binary)
      .map((byte) => String.fromCharCode(byte))
      .join('');

    return text;
  }
}
