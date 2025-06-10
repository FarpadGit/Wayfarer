import { app, dateTimeReviver, mockPostRepo } from '../app.e2e-spec';
import { mockAdmin, mockCategory, mockGuest, mockPost } from '../mocks';

export function assertionsForPosts() {
  describe('posts controllers', () => {
    it('/posts/:id (GET)', async () => {
      return app
        .inject({
          method: 'GET',
          url: '/posts/1',
        })
        .then((result) => {
          const parsedPayload = JSON.parse(result.payload, dateTimeReviver);

          expect(result.statusCode).toBe(200);
          expect(parsedPayload).toEqual(mockPost);
        });
    });

    it('/posts/:id (GET) (not found)', async () => {
      mockPostRepo.findOne?.mockResolvedValueOnce(null);

      return app
        .inject({
          method: 'GET',
          url: '/posts/1',
        })
        .then((result) => {
          expect(result.statusCode).toBe(404);
        });
    });

    it('/posts/:id (PATCH)', async () => {
      mockPostRepo.findOne?.mockResolvedValueOnce({
        ...mockPost,
        uploader: mockGuest,
      });

      return app
        .inject({
          method: 'PATCH',
          url: '/posts/1',
          body: {
            images: [{ name: 'img.jpg', url: 'url.com', postId: '123' }],
          },
        })
        .then((result) => {
          expect(result.statusCode).toBe(200);
        });
    });

    it('/posts/:id (PATCH) (not found)', async () => {
      mockPostRepo.findOne?.mockResolvedValueOnce(null);

      return app
        .inject({
          method: 'PATCH',
          url: '/posts/1',
          body: {
            images: [{ name: 'img.jpg', url: 'url.com', postId: '123' }],
          },
        })
        .then((result) => {
          expect(result.statusCode).toBe(400);
        });
    });

    it('/posts/:id (PATCH) (bad credentials)', async () => {
      mockPostRepo.findOne?.mockResolvedValueOnce({
        ...mockPost,
        uploader: mockAdmin,
      });

      return app
        .inject({
          method: 'PATCH',
          url: '/posts/1',
          body: {
            images: [{ name: 'img.jpg', url: 'url.com', postId: '123' }],
          },
        })
        .then((result) => {
          const parsedPayload = JSON.parse(result.payload, dateTimeReviver);

          expect(result.statusCode).toBe(401);
          expect(Object.keys(parsedPayload).includes('message')).toBe(true);
        });
    });

    it('/posts/:id (DELETE)', async () => {
      const _mockPost = {
        ...mockPost,
        uploader: mockGuest,
      };
      mockPostRepo.findOne?.mockResolvedValueOnce(_mockPost);
      mockPostRepo.findOne?.mockResolvedValueOnce(_mockPost);

      return app
        .inject({
          method: 'DELETE',
          url: '/posts/1',
        })
        .then((result) => {
          const parsedPayload = JSON.parse(result.payload);

          expect(result.statusCode).toBe(200);
          expect(parsedPayload.id).toBe('1');
        });
    });

    it('/posts/:id (DELETE) (not found)', async () => {
      mockPostRepo.findOne?.mockResolvedValueOnce(null);
      mockPostRepo.findOne?.mockResolvedValueOnce(null);

      return app
        .inject({
          method: 'DELETE',
          url: '/posts/1',
        })
        .then((result) => {
          expect(result.statusCode).toBe(400);
        });
    });

    it('/posts/:id (DELETE) (bad credentials)', async () => {
      const _mockPost = {
        ...mockCategory,
        uploader: mockAdmin,
      };
      mockPostRepo.findOne?.mockResolvedValueOnce(_mockPost);
      mockPostRepo.findOne?.mockResolvedValueOnce(_mockPost);

      return app
        .inject({
          method: 'DELETE',
          url: '/posts/1',
        })
        .then((result) => {
          const parsedPayload = JSON.parse(result.payload);

          expect(result.statusCode).toBe(401);
          expect(Object.keys(parsedPayload).includes('message')).toBe(true);
        });
    });

    it('/posts/:id/comments (POST)', async () => {
      return app
        .inject({
          method: 'POST',
          url: '/posts/1/comments',
          body: { message: 'lorem ipsum', parentId: '123' },
        })
        .then((result) => {
          expect(result.statusCode).toBe(201);
        });
    });

    it('/posts/:id/comments (POST) (bad body)', async () => {
      return app
        .inject({
          method: 'POST',
          url: '/posts/1/comments',
          body: { wrongData: true },
        })
        .then((result) => {
          const parsedPayload = JSON.parse(result.payload);

          expect(result.statusCode).toBe(400);
          expect(Object.keys(parsedPayload).includes('message')).toBe(true);
        });
    });
  });
}
