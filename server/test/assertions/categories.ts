import { app, dateTimeReviver, mockCategoryRepo } from '../app.e2e-spec';
import { mockAdmin, mockCategory, mockGuest, mockPost } from '../mocks';

export function assertionsForCategories() {
  describe('categories controllers', () => {
    it('/categories (GET)', async () => {
      return app
        .inject({
          method: 'GET',
          url: '/categories',
        })
        .then((result) => {
          const parsedPayload = JSON.parse(result.payload, dateTimeReviver);

          expect(result.statusCode).toBe(200);
          expect(parsedPayload).toEqual([mockCategory, mockCategory]);
        });
    });

    it('/categories (POST)', async () => {
      return app
        .inject({
          method: 'POST',
          url: '/categories',
          body: { title: 'Fake New Category' },
        })
        .then((result) => {
          expect(result.statusCode).toBe(201);
        });
    });

    it('/categories (POST) (bad body)', async () => {
      return app
        .inject({
          method: 'POST',
          url: '/categories',
          body: { wrongData: true },
        })
        .then((result) => {
          const parsedPayload = JSON.parse(result.payload);

          expect(result.statusCode).toBe(400);
          expect(Object.keys(parsedPayload).includes('message')).toBe(true);
        });
    });

    it('/categories/:id (DELETE)', async () => {
      mockCategoryRepo.findOne?.mockResolvedValueOnce({
        ...mockCategory,
        creator: mockGuest,
      });

      return app
        .inject({
          method: 'DELETE',
          url: '/categories/1',
        })
        .then((result) => {
          expect(result.statusCode).toBe(204);
        });
    });

    it('/categories/:id (DELETE) (not found)', async () => {
      mockCategoryRepo.findOne?.mockResolvedValueOnce(null);

      return app
        .inject({
          method: 'DELETE',
          url: '/categories/1',
        })
        .then((result) => {
          expect(result.statusCode).toBe(400);
        });
    });

    it('/categories/:id (DELETE) (bad credentials)', async () => {
      mockCategoryRepo.findOne?.mockResolvedValueOnce({
        ...mockCategory,
        creator: mockAdmin,
      });

      return app
        .inject({
          method: 'DELETE',
          url: '/categories/1',
        })
        .then((result) => {
          const parsedPayload = JSON.parse(result.payload);

          expect(result.statusCode).toBe(401);
          expect(Object.keys(parsedPayload).includes('message')).toBe(true);
        });
    });

    it('/categories/:id/posts (GET)', async () => {
      return app
        .inject({
          method: 'GET',
          url: '/categories/1/posts',
        })
        .then((result) => {
          const parsedPayload = JSON.parse(result.payload, dateTimeReviver);

          expect(result.statusCode).toBe(200);
          expect(parsedPayload).toEqual([mockPost, mockPost]);
        });
    });

    it('/categories/:id/posts (GET) (not found)', async () => {
      mockCategoryRepo.findOne?.mockResolvedValueOnce(null);

      return app
        .inject({
          method: 'GET',
          url: '/categories/1/posts',
        })
        .then((result) => {
          expect(result.statusCode).toBe(404);
        });
    });

    it('/categories/:id/posts (POST)', async () => {
      return app
        .inject({
          method: 'POST',
          url: '/categories/1/posts',
          body: { title: 'Fake New Post', body: 'lorem ipsum' },
        })
        .then((result) => {
          expect(result.statusCode).toBe(201);
        });
    });

    it('/categories/:id/posts (POST) (bad body)', async () => {
      return app
        .inject({
          method: 'POST',
          url: '/categories/1/posts',
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
