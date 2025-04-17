import { app, mockCommentRepo, mockLikeRepo } from '../app.e2e-spec';
import { mockAdmin, mockComment, mockGuest } from '../mocks';

export function assertionsForComments() {
  describe('comments controllers', () => {
    it('/comments/:id (PUT)', async () => {
      mockCommentRepo.findOne?.mockResolvedValueOnce({
        ...mockComment,
        user: mockGuest,
      });

      return app
        .inject({
          method: 'PUT',
          url: '/comments/1',
          body: { message: 'Updated Message' },
        })
        .then((result) => {
          expect(result.statusCode).toBe(200);
        });
    });

    it('/comments/:id (PUT) (bad body)', async () => {
      return app
        .inject({
          method: 'PUT',
          url: '/comments/1',
          body: { wrongData: true },
        })
        .then((result) => {
          const parsedPayload = JSON.parse(result.payload);

          expect(result.statusCode).toBe(400);
          expect(Object.keys(parsedPayload).includes('message')).toBe(true);
        });
    });

    it('/comments/:id (PUT) (not found)', async () => {
      mockCommentRepo.findOne?.mockResolvedValueOnce(null);

      return app
        .inject({
          method: 'PUT',
          url: '/comments/1',
          body: { message: 'Updated Message' },
        })
        .then((result) => {
          expect(result.statusCode).toBe(400);
        });
    });

    it('/comments/:id (PUT) (bad credentials)', async () => {
      mockCommentRepo.findOne?.mockResolvedValueOnce({
        ...mockComment,
        user: mockAdmin,
      });

      return app
        .inject({
          method: 'PUT',
          url: '/comments/1',
          body: { message: 'Updated Message' },
        })
        .then((result) => {
          const parsedPayload = JSON.parse(result.payload);

          expect(result.statusCode).toBe(401);
          expect(Object.keys(parsedPayload).includes('message')).toBe(true);
        });
    });

    it('/comments/:id (DELETE)', async () => {
      mockCommentRepo.findOne?.mockResolvedValueOnce({
        ...mockComment,
        user: mockGuest,
      });

      return app
        .inject({
          method: 'DELETE',
          url: '/comments/1',
        })
        .then((result) => {
          expect(result.statusCode).toBe(204);
        });
    });

    it('/comments/:id (DELETE) (not found)', async () => {
      mockCommentRepo.findOne?.mockResolvedValueOnce(null);

      return app
        .inject({
          method: 'DELETE',
          url: '/comments/1',
        })
        .then((result) => {
          expect(result.statusCode).toBe(400);
        });
    });

    it('/comments/:id (DELETE) (bad credentials)', async () => {
      mockCommentRepo.findOne?.mockResolvedValueOnce({
        ...mockComment,
        user: mockAdmin,
      });

      return app
        .inject({
          method: 'DELETE',
          url: '/comments/1',
        })
        .then((result) => {
          const parsedPayload = JSON.parse(result.payload);

          expect(result.statusCode).toBe(401);
          expect(Object.keys(parsedPayload).includes('message')).toBe(true);
        });
    });

    it('/comments/:id/toggleLike (POST) (on)', async () => {
      mockLikeRepo.findOne?.mockResolvedValueOnce(null);

      return app
        .inject({
          method: 'POST',
          url: '/comments/1/toggleLike',
        })
        .then((result) => {
          const parsedPayload = JSON.parse(result.payload);

          expect(result.statusCode).toBe(201);
          expect(parsedPayload).toEqual({ isLikeAdded: true });
        });
    });

    it('/comments/:id/toggleLike (POST) (off)', async () => {
      return app
        .inject({
          method: 'POST',
          url: '/comments/1/toggleLike',
        })
        .then((result) => {
          const parsedPayload = JSON.parse(result.payload);

          expect(result.statusCode).toBe(201);
          expect(parsedPayload).toEqual({ isLikeAdded: false });
        });
    });
  });
}
