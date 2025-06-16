import { app, mockImageRepo } from '../app.e2e-spec';
import { mockGuest, mockImage, mockPost } from '../mocks';

export function assertionsForImages() {
  describe('images controllers', () => {
    it('/images (POST)', async () => {
      return app
        .inject({
          method: 'POST',
          url: '/images',
          body: {
            files: [{ name: 'fakeImg.jpg', url: 'fakeBlobUrl' }],
            uploaderName: mockGuest.name,
            postId: mockPost.id,
            temporary: true,
          },
        })
        .then((result) => {
          expect(result.statusCode).toBe(201);
        });
    });

    it('/images (POST) (bad body)', async () => {
      return app
        .inject({
          method: 'POST',
          url: '/images',
          body: { wrongData: true },
        })
        .then((result) => {
          JSON.parse(result.payload);

          expect(result.statusCode).toBe(400);
        });
    });

    it('/images (DELETE)', async () => {
      mockImageRepo.findOne?.mockResolvedValueOnce({
        ...mockImage,
        post: {
          ...mockPost,
          uploader: mockGuest,
        },
      });

      return app
        .inject({
          method: 'DELETE',
          url: '/images',
          body: { imageName: 'fakeImage.jpg' },
        })
        .then((result) => {
          expect(result.statusCode).toBe(204);
        });
    });

    it('/images (DELETE) (bad credentials)', async () => {
      mockImageRepo.findOne?.mockResolvedValueOnce(mockImage);

      return app
        .inject({
          method: 'DELETE',
          url: '/images',
          body: { imageName: 'fakeImage.jpg' },
        })
        .then((result) => {
          const parsedPayload = JSON.parse(result.payload);

          expect(result.statusCode).toBe(401);
          expect(Object.keys(parsedPayload).includes('message')).toBe(true);
        });
    });
  });
}
