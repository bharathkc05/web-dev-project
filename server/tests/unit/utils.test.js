// server/tests/unit/utils.test.js
import { ApiError } from '../../src/shared/utils/ApiError.js';
import { ApiResponse } from '../../src/shared/utils/ApiResponse.js';
import { sendEmail } from '../../src/shared/utils/email.js';

describe('utils unit tests', () => {
  describe('ApiError', () => {
    test('badRequest creates 400 error', () => {
      const err = ApiError.badRequest('Bad data', [{ field: 'x' }]);
      expect(err.statusCode).toBe(400);
      expect(err.message).toBe('Bad data');
      expect(err.errors).toEqual([{ field: 'x' }]);
    });

    test('unauthorized creates 401 error', () => {
      const err = ApiError.unauthorized('Not authed');
      expect(err.statusCode).toBe(401);
      expect(err.message).toBe('Not authed');
    });

    test('forbidden creates 403 error', () => {
      const err = ApiError.forbidden('No access');
      expect(err.statusCode).toBe(403);
      expect(err.message).toBe('No access');
    });

    test('notFound creates 404 error', () => {
      const err = ApiError.notFound('Missing');
      expect(err.statusCode).toBe(404);
      expect(err.message).toBe('Missing');
    });

    test('conflict creates 409 error', () => {
      const err = ApiError.conflict('Already exists');
      expect(err.statusCode).toBe(409);
      expect(err.message).toBe('Already exists');
    });

    test('internal creates 500 non-operational error', () => {
      const err = ApiError.internal('Server boom');
      expect(err.statusCode).toBe(500);
      expect(err.message).toBe('Server boom');
      expect(err.isOperational).toBe(false);
    });

    test('tooManyRequests creates 429 error', () => {
      const err = ApiError.tooManyRequests('Slow down');
      expect(err.statusCode).toBe(429);
      expect(err.message).toBe('Slow down');
    });
  });

  describe('ApiResponse', () => {
    test('ok creates 200 response', () => {
      const res = ApiResponse.ok({ id: 1 }, 'Fetched');
      expect(res.success).toBe(true);
      expect(res.statusCode).toBe(200);
      expect(res.data).toEqual({ id: 1 });
      expect(res.message).toBe('Fetched');
    });

    test('created creates 201 response', () => {
      const res = ApiResponse.created({ id: 2 }, 'Made');
      expect(res.success).toBe(true);
      expect(res.statusCode).toBe(201);
      expect(res.data).toEqual({ id: 2 });
      expect(res.message).toBe('Made');
    });

    test('noContent creates 204 response', () => {
      const res = ApiResponse.noContent('Deleted');
      expect(res.success).toBe(true);
      expect(res.statusCode).toBe(204);
      expect(res.data).toBeNull();
      expect(res.message).toBe('Deleted');
    });
  });

  describe('email utils', () => {
    test('sendEmail returns mock message ID when credentials are not configured', async () => {
      // Temporarily remove email configs
      const user = process.env.EMAIL_USER;
      const pass = process.env.EMAIL_PASS;
      delete process.env.EMAIL_USER;
      delete process.env.EMAIL_PASS;

      const result = await sendEmail({ to: 'test@example.com', subject: 'Hi', html: '<p>Hi</p>' });
      expect(result.messageId).toBe('mock-message-id');

      process.env.EMAIL_USER = user;
      process.env.EMAIL_PASS = pass;
    });
  });
});
