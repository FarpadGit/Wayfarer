import { app, mockUserRepo } from '../app.e2e-spec';
import { mockAdmin, mockGuest, mockUser } from '../mocks';

export function assertionsForAuthentication() {
  describe('auth controller', () => {
    it('/login (POST) (with admin)', async () => {
      return app
        .inject({
          method: 'POST',
          url: '/login',
          body: {
            userToken: {
              email: mockAdmin.email,
              name: mockAdmin.name,
              sub: '',
            },
          },
        })
        .then((result) => {
          const userIdCookie = result.cookies.find(
            (cookie) => cookie.name === 'userId',
          )?.value;

          expect(result.statusCode).toBe(200);
          expect(result.payload).toBe('true');
          expect(userIdCookie).toBe(mockAdmin.id);
        });
    });

    it('/login (POST) (with guest)', async () => {
      return app
        .inject({
          method: 'POST',
          url: '/login',
          body: {
            userToken: {
              email: mockGuest.email,
              name: mockGuest.name,
              sub: '',
            },
          },
        })
        .then((result) => {
          const userIdCookie = result.cookies.find(
            (cookie) => cookie.name === 'userId',
          )?.value;

          expect(result.statusCode).toBe(200);
          expect(result.payload).toBe('true');
          expect(userIdCookie).toBe(mockGuest.id);
        });
    });

    it('/login (POST) (with new user)', async () => {
      mockUserRepo.findOne?.mockResolvedValueOnce(null);

      return app
        .inject({
          method: 'POST',
          url: '/login',
          body: {
            userToken: {
              email: 'user@email.com',
              name: 'Fake User',
              sub: '12345',
            },
          },
        })
        .then((result) => {
          const userIdCookie = result.cookies.find(
            (cookie) => cookie.name === 'userId',
          )?.value;

          expect(result.statusCode).toBe(200);
          expect(result.payload).toBe('true');
          expect(userIdCookie).toBe(mockUser.id);
        });
    });
  });

  describe('after admin login', () => {
    function adminLogin() {
      return app.inject({
        method: 'POST',
        url: '/login',
        body: {
          userToken: {
            email: mockAdmin.email,
            name: mockAdmin.name,
            sub: '',
          },
        },
      });
    }

    it('/categories/:id (DELETE) (with admin)', async () => {
      const loginResult = await adminLogin();
      const userIdCookie = loginResult.cookies.find(
        (cookie) => cookie.name === 'userId',
      )!.value;

      return app
        .inject({
          method: 'DELETE',
          url: '/categories/1',
          cookies: { userId: userIdCookie },
        })
        .then((result) => {
          expect(result.statusCode).toBe(204);
        });
    });

    it('/posts/:id (DELETE) (with admin)', async () => {
      const loginResult = await adminLogin();
      const userIdCookie = loginResult.cookies.find(
        (cookie) => cookie.name === 'userId',
      )!.value;

      return app
        .inject({
          method: 'DELETE',
          url: '/posts/1',
          cookies: { userId: userIdCookie },
        })
        .then((result) => {
          const parsedPayload = JSON.parse(result.payload);

          expect(result.statusCode).toBe(200);
          expect(parsedPayload.id).toBe('1');
        });
    });

    it('/comments/:id (PUT) (with admin)', async () => {
      const loginResult = await adminLogin();
      const userIdCookie = loginResult.cookies.find(
        (cookie) => cookie.name === 'userId',
      )!.value;

      return app
        .inject({
          method: 'PUT',
          url: '/comments/1',
          body: { message: 'Updated Message' },
          cookies: { userId: userIdCookie },
        })
        .then((result) => {
          expect(result.statusCode).toBe(200);
        });
    });

    it('/comments/:id (DELETE) (with admin)', async () => {
      const loginResult = await adminLogin();
      const userIdCookie = loginResult.cookies.find(
        (cookie) => cookie.name === 'userId',
      )!.value;

      return app
        .inject({
          method: 'DELETE',
          url: '/comments/1',
          cookies: { userId: userIdCookie },
        })
        .then((result) => {
          expect(result.statusCode).toBe(204);
        });
    });
  });

  describe('after user login', () => {
    function userLogin() {
      return app.inject({
        method: 'POST',
        url: '/login',
        body: {
          userToken: {
            email: mockUser.email,
            name: mockUser.name,
            sub: '12345',
          },
        },
      });
    }

    it('/categories/:id (DELETE) (with logged in user)', async () => {
      const loginResult = await userLogin();
      const userIdCookie = loginResult.cookies.find(
        (cookie) => cookie.name === 'userId',
      )!.value;

      return app
        .inject({
          method: 'DELETE',
          url: '/categories/1',
          cookies: { userId: userIdCookie },
        })
        .then((result) => {
          expect(result.statusCode).toBe(204);
        });
    });

    it('/posts/:id (DELETE) (with logged in user)', async () => {
      const loginResult = await userLogin();
      const userIdCookie = loginResult.cookies.find(
        (cookie) => cookie.name === 'userId',
      )!.value;

      return app
        .inject({
          method: 'DELETE',
          url: '/posts/1',
          cookies: { userId: userIdCookie },
        })
        .then((result) => {
          const parsedPayload = JSON.parse(result.payload);

          expect(result.statusCode).toBe(200);
          expect(parsedPayload.id).toBe('1');
        });
    });

    it('/comments/:id (PUT) (with logged in user)', async () => {
      const loginResult = await userLogin();
      const userIdCookie = loginResult.cookies.find(
        (cookie) => cookie.name === 'userId',
      )!.value;

      return app
        .inject({
          method: 'PUT',
          url: '/comments/1',
          body: { message: 'Updated Message' },
          cookies: { userId: userIdCookie },
        })
        .then((result) => {
          expect(result.statusCode).toBe(200);
        });
    });

    it('/comments/:id (DELETE) (with logged in user)', async () => {
      const loginResult = await userLogin();
      const userIdCookie = loginResult.cookies.find(
        (cookie) => cookie.name === 'userId',
      )!.value;

      return app
        .inject({
          method: 'DELETE',
          url: '/comments/1',
          cookies: { userId: userIdCookie },
        })
        .then((result) => {
          expect(result.statusCode).toBe(204);
        });
    });
  });
}
