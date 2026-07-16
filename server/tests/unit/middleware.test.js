// server/tests/unit/middleware.test.js
import { jest } from '@jest/globals';
import { ApiError } from '../../src/shared/utils/ApiError.js';
import { z } from 'zod';

const mockVerify = jest.fn();
const mockFindById = jest.fn();
const mockLoggerError = jest.fn();

jest.unstable_mockModule('jsonwebtoken', () => ({
  default: { verify: mockVerify },
}));

jest.unstable_mockModule('../../src/modules/auth/auth.model.js', () => ({
  default: { findById: mockFindById },
}));

jest.unstable_mockModule('../../src/shared/utils/logger.js', () => ({
  default: { error: mockLoggerError },
}));

const { authenticate, authenticateAllowExpired } = await import('../../src/shared/middleware/authenticate.js');
const { authorize } = await import('../../src/shared/middleware/authorize.js');
const { asyncHandler } = await import('../../src/shared/middleware/asyncHandler.js');
const { errorHandler, notFoundHandler } = await import('../../src/shared/middleware/errorHandler.js');
const { validateRequest } = await import('../../src/shared/middleware/validate.js');

describe('middleware unit tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockReq = (overrides = {}) => ({ headers: {}, ...overrides });
  const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };
  const mockNext = jest.fn();

  describe('authenticate', () => {
    test('allows valid JWT', async () => {
      const req = mockReq({ headers: { authorization: 'Bearer valid-token' } });
      const res = mockRes();
      
      mockVerify.mockReturnValue({ sub: 'user-1' });
      const mockUser = { _id: 'user-1', email: 'a@b.com', role: 'CUSTOMER', isActive: true };
      mockFindById.mockReturnValue({ select: () => ({ lean: () => Promise.resolve(mockUser) }) });

      await authenticate(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(); // called without error
      expect(req.user.userId).toBe('user-1');
    });

    test('rejects missing header', async () => {
      const req = mockReq();
      const res = mockRes();

      await authenticate(req, res, mockNext);
      expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
      expect(mockNext.mock.calls[0][0].statusCode).toBe(401);
    });

    test('rejects expired token', async () => {
      const req = mockReq({ headers: { authorization: 'Bearer valid-token' } });
      const res = mockRes();
      
      const err = new Error('jwt expired');
      err.name = 'TokenExpiredError';
      mockVerify.mockImplementation(() => { throw err; });

      await authenticate(req, res, mockNext);
      expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
      expect(mockNext.mock.calls[0][0].statusCode).toBe(401);
    });

    test('rejects inactive user', async () => {
      const req = mockReq({ headers: { authorization: 'Bearer valid-token' } });
      const res = mockRes();
      
      mockVerify.mockReturnValue({ sub: 'user-1' });
      const mockUser = { _id: 'user-1', email: 'a@b.com', role: 'CUSTOMER', isActive: false };
      mockFindById.mockReturnValue({ select: () => ({ lean: () => Promise.resolve(mockUser) }) });

      await authenticate(req, res, mockNext);
      expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
      expect(mockNext.mock.calls[0][0].statusCode).toBe(401);
    });
  });

  describe('authenticateAllowExpired', () => {
    test('allows expired-but-valid JWT', async () => {
      const req = mockReq({ headers: { authorization: 'Bearer expired-token' } });
      const res = mockRes();
      
      // verify should be called with ignoreExpiration: true
      mockVerify.mockReturnValue({ sub: 'user-1' });
      const mockUser = { _id: 'user-1', email: 'a@b.com', role: 'CUSTOMER', isActive: true };
      mockFindById.mockReturnValue({ select: () => ({ lean: () => Promise.resolve(mockUser) }) });

      await authenticateAllowExpired(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith();
      expect(mockVerify).toHaveBeenCalledWith('expired-token', expect.any(String), { ignoreExpiration: true });
    });

    test('rejects structurally invalid token', async () => {
      const req = mockReq({ headers: { authorization: 'Bearer invalid-token' } });
      const res = mockRes();
      
      const err = new Error('invalid signature');
      err.name = 'JsonWebTokenError';
      mockVerify.mockImplementation(() => { throw err; });

      await authenticateAllowExpired(req, res, mockNext);
      expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
      expect(mockNext.mock.calls[0][0].statusCode).toBe(401);
    });
  });

  describe('authorize', () => {
    test('allows matching role', () => {
      const req = mockReq({ user: { role: 'ADMIN' } });
      const res = mockRes();
      
      authorize('ADMIN', 'OUTLET_MANAGER')(req, res, mockNext);
      expect(mockNext).toHaveBeenCalledWith(); // no args = success
    });

    test('rejects non-matching role', () => {
      const req = mockReq({ user: { role: 'CUSTOMER' } });
      const res = mockRes();
      
      authorize('ADMIN', 'OUTLET_MANAGER')(req, res, mockNext);
      expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
      expect(mockNext.mock.calls[0][0].statusCode).toBe(403);
    });

    test('rejects missing req.user', () => {
      const req = mockReq(); // no user
      const res = mockRes();
      
      authorize('ADMIN')(req, res, mockNext);
      expect(mockNext).toHaveBeenCalledWith(expect.any(ApiError));
      expect(mockNext.mock.calls[0][0].statusCode).toBe(401);
    });
  });

  describe('asyncHandler', () => {
    test('forwards to next on promise rejection', async () => {
      const err = new Error('test error');
      const handler = asyncHandler(async () => { throw err; });
      
      await handler(mockReq(), mockRes(), mockNext);
      expect(mockNext).toHaveBeenCalledWith(err);
    });

    test('calls handler normally on success', async () => {
      const handler = asyncHandler(async (req, res) => { res.status(200).json({ ok: true }); });
      const res = mockRes();
      
      await handler(mockReq(), res, mockNext);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('errorHandler', () => {
    test('handles ApiError', () => {
      const err = ApiError.badRequest('Bad thing');
      const req = mockReq({ method: 'GET', path: '/' });
      const res = mockRes();
      
      errorHandler(err, req, res, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Bad thing', success: false }));
    });

    test('handles duplicate key (11000)', () => {
      const err = { code: 11000, keyValue: { email: 'x@x.com' } };
      const req = mockReq({ method: 'POST', path: '/' });
      const res = mockRes();
      
      errorHandler(err, req, res, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'email already exists' }));
    });
  });

  describe('notFoundHandler', () => {
    test('returns 404 with route info', () => {
      const req = mockReq({ method: 'GET', path: '/unknown' });
      const res = mockRes();
      
      notFoundHandler(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Route GET /unknown not found' }));
    });
  });

  describe('validateRequest', () => {
    const schema = z.object({ name: z.string() });

    test('passes valid body', () => {
      const req = mockReq({ body: { name: 'Test' } });
      const res = mockRes();
      
      validateRequest(schema)(req, res, mockNext);
      expect(mockNext).toHaveBeenCalledWith();
    });

    test('returns 400 for invalid body', () => {
      const req = mockReq({ body: { age: 25 } });
      const res = mockRes();
      
      validateRequest(schema)(req, res, mockNext);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: 'Validation failed'
      }));
    });
  });
});
