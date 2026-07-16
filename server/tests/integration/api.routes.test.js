// server/tests/integration/api.routes.test.js
import { jest } from '@jest/globals';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Setup environment and secrets
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_1234567890123456';
process.env.REFRESH_SECRET = 'test_refresh_secret_1234567890123456';
process.env.JWT_EXPIRES_IN = '15m';
process.env.REFRESH_EXPIRES_IN = '7d';

// 1. Mock Redis
const mockRedisClient = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  incr: jest.fn(),
  expire: jest.fn(),
};

jest.unstable_mockModule('../../src/shared/utils/redis.js', () => ({
  getRedisClient: jest.fn().mockResolvedValue(mockRedisClient),
}));

// 2. Mock Rate Limiter (pass-through)
jest.unstable_mockModule('../../src/shared/middleware/rateLimiter.js', () => ({
  apiLimiter: (req, res, next) => next(),
  authLimiter: (req, res, next) => next(),
}));

// 3. Mock Models
const mockUserFindOne = jest.fn();
const mockUserCreate = jest.fn();
const mockUserFindById = jest.fn();

jest.unstable_mockModule('../../src/modules/auth/auth.model.js', () => ({
  default: {
    findOne: mockUserFindOne,
    create: mockUserCreate,
    findById: mockUserFindById,
  }
}));

const mockProductAggregate = jest.fn();
const mockProductFindById = jest.fn();
jest.unstable_mockModule('../../src/modules/products/product.model.js', () => ({
  Product: {
    aggregate: mockProductAggregate,
    findById: mockProductFindById,
  },
  MasterProduct: { findById: jest.fn() },
  Offer: { findOne: jest.fn() },
  Review: { aggregate: jest.fn() }
}));

const mockCacheGet = jest.fn();
const mockCacheSet = jest.fn();
jest.unstable_mockModule('../../src/shared/utils/cacheHelper.js', () => ({
  getCache: mockCacheGet,
  setCache: mockCacheSet,
  deleteCache: jest.fn(),
  deleteCachePattern: jest.fn(),
}));

jest.unstable_mockModule('../../src/shared/utils/logger.js', () => ({
  default: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  }
}));

// Import App after mocks are setup
const { default: app } = await import('../../src/app.js');

describe('API Routes Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRedisClient.get.mockResolvedValue(null);
    mockRedisClient.set.mockResolvedValue('OK');
    mockCacheGet.mockResolvedValue(null);
  });

  describe('Health Check', () => {
    test('GET /health returns UP status', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('UP');
    });
  });

  describe('Auth Routes', () => {
    test('POST /api/auth/signup creates user and returns tokens', async () => {
      mockUserFindOne.mockResolvedValue(null); // No existing user
      mockUserCreate.mockResolvedValue({
        _id: 'user-1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'CUSTOMER',
        isActive: true,
      });

      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          password: 'Password123!',
          phone: '1234567890'
        });

      expect(res.status).toBe(201); // 201 Created
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('john@example.com');
      expect(res.body.data.accessToken).toBeDefined();
    });

    test('POST /api/auth/login returns 401 on bad credentials', async () => {
      const selectMock = jest.fn().mockResolvedValue(null);
      mockUserFindOne.mockReturnValue({ select: selectMock });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'john@example.com',
          password: 'WrongPassword!'
        });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Invalid email or password');
    });

    test('GET /api/auth/me returns profile for authenticated user', async () => {
      const token = jwt.sign({ sub: 'user-1', role: 'CUSTOMER' }, process.env.JWT_SECRET);
      
      const mockUser = {
        _id: 'user-1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'CUSTOMER',
        isActive: true
      };
      
      const userQueryMock = {
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockUser),
        then: function(resolve) { resolve(mockUser); } // Makes it awaitable directly
      };
      
      mockUserFindById.mockReturnValue(userQueryMock);

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe('john@example.com');
    });
  });

  describe('Product Routes', () => {
    test('GET /api/products returns paginated list', async () => {
      const mockProducts = [
        { _id: 'prod-1', name: 'Burger', price: 10 }
      ];
      mockProductAggregate.mockResolvedValue(mockProducts);
      mockCacheSet.mockResolvedValue(undefined);

      const res = await request(app).get('/api/products?limit=10');

      expect(res.status).toBe(200);
      expect(res.body.data.items.length).toBe(1);
      expect(res.body.data.items[0].name).toBe('Burger');
    });

    test('GET /api/products/:id returns 404 for missing product', async () => {
      mockProductAggregate.mockResolvedValue([]);

      const res = await request(app).get('/api/products/507f1f77bcf86cd799439011');

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Product not found');
    });
  });

  describe('Not Found', () => {
    test('GET /api/unknown returns 404', async () => {
      const res = await request(app).get('/api/unknown');
      expect(res.status).toBe(404);
      expect(res.body.message).toContain('not found');
    });
  });
});
