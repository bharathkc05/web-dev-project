// server/tests/e2e/order-lifecycle.test.js
import { jest } from '@jest/globals';
import request from 'supertest';
import jwt from 'jsonwebtoken';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_1234567890123456';
process.env.REFRESH_SECRET = 'test_refresh_secret_1234567890123456';

const MOCK_USER_ID = '507f1f77bcf86cd799439011';
const MOCK_PROD_ID = '507f1f77bcf86cd799439012';
const MOCK_CART_ID = '507f1f77bcf86cd799439013';
const MOCK_ORDER_ID = '507f1f77bcf86cd799439014';
const MOCK_OUTLET_ID = '507f1f77bcf86cd799439015';

// ---------------- In-Memory DB Simulator ----------------
const DB = {
  users: [],
  products: [{
    _id: MOCK_PROD_ID,
    outletId: MOCK_OUTLET_ID,
    masterProductId: { name: 'E2E Burger' },
    price: 10.99,
    isAvailable: true,
  }],
  carts: [],
  orders: [],
  redis: new Map(),
};

// 1. Mock Redis
const mockRedisClient = {
  get: jest.fn().mockImplementation((key) => Promise.resolve(DB.redis.get(key) || null)),
  set: jest.fn().mockImplementation((key, val) => { DB.redis.set(key, val); return Promise.resolve('OK'); }),
  del: jest.fn().mockImplementation((key) => { DB.redis.delete(key); return Promise.resolve(1); }),
  incr: jest.fn().mockResolvedValue(1),
  expire: jest.fn().mockResolvedValue(1),
};
jest.unstable_mockModule('../../src/shared/utils/redis.js', () => ({
  getRedisClient: jest.fn().mockResolvedValue(mockRedisClient),
}));

jest.unstable_mockModule('../../src/shared/utils/cacheHelper.js', () => ({
  getCache: jest.fn().mockResolvedValue(null),
  setCache: jest.fn().mockResolvedValue(undefined),
  deleteCache: jest.fn(),
  deleteCachePattern: jest.fn(),
}));

// 2. Mock BullMQ, Socket, Razorpay, Limiter
jest.unstable_mockModule('../../src/modules/orders/order.worker.js', () => ({
  pushBullMQJob: jest.fn().mockResolvedValue(true),
  initOrderWorker: jest.fn(),
}));
jest.unstable_mockModule('../../src/shared/utils/socketManager.js', () => ({
  emitToRoom: jest.fn(),
}));
jest.unstable_mockModule('../../src/modules/orders/payment.service.js', () => ({
  createRazorpayOrder: jest.fn().mockResolvedValue('rzp_order_mock_1'),
  verifySignature: jest.fn().mockReturnValue(true),
  initiateRefund: jest.fn(),
}));
jest.unstable_mockModule('../../src/shared/middleware/rateLimiter.js', () => ({
  apiLimiter: (req, res, next) => next(),
  authLimiter: (req, res, next) => next(),
}));
jest.unstable_mockModule('../../src/shared/utils/logger.js', () => ({
  default: { info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }
}));

// 3. Mock Mongoose Models
jest.unstable_mockModule('../../src/modules/auth/auth.model.js', () => ({
  default: {
    findOne: jest.fn().mockImplementation((query) => {
      const user = DB.users.find(u => u.email === query.email);
      if (!user) return Promise.resolve(null);
      // Mongoose select chaining mock
      return { select: () => Promise.resolve(user) };
    }),
    findById: jest.fn().mockImplementation((id) => {
      const user = DB.users.find(u => u._id === id);
      if (!user) return Promise.resolve(null);
      return { select: () => ({ lean: () => Promise.resolve(user) }), lean: () => Promise.resolve(user) };
    }),
    create: jest.fn().mockImplementation(async (data) => {
      const newUser = { 
        _id: MOCK_USER_ID, 
        role: 'CUSTOMER', 
        ...data, 
        isActive: true, 
        savedAddresses: [], 
        favouriteProductIds: [] 
      };
      newUser.toJSON = () => newUser;
      DB.users.push(newUser);
      return newUser;
    }),
  }
}));

jest.unstable_mockModule('../../src/modules/products/product.model.js', () => ({
  Product: {
    findById: jest.fn().mockImplementation((id) => {
      const product = DB.products.find(p => String(p._id) === String(id));
      if (!product) {
        return {
          lean: () => Promise.resolve(null),
          then: function(resolve) { resolve(null); }
        };
      }
      return { 
        lean: () => Promise.resolve(product),
        then: function(resolve) { resolve(product); }
      };
    }),
  },
  Offer: { findOne: jest.fn().mockResolvedValue(null) },
  MasterProduct: { findById: jest.fn().mockResolvedValue(null) },
  Review: { aggregate: jest.fn().mockResolvedValue([]) },
}));

jest.unstable_mockModule('../../src/modules/orders/order.model.js', () => ({
  Cart: {
    findOne: jest.fn().mockImplementation((query) => {
      const cart = DB.carts.find(c => String(c.userId) === String(query.userId));
      if (!cart) {
        return { 
          populate: () => ({ 
            lean: () => Promise.resolve(null),
            then: function(resolve) { resolve(null); }
          }), 
          lean: () => Promise.resolve(null),
          then: function(resolve) { resolve(null); }
        };
      }
      
      const cartDoc = { ...cart, save: async () => { Object.assign(cart, cartDoc); } };
      
      return {
        populate: () => {
          const populatedCart = { ...cartDoc };
          if (populatedCart.items) {
            populatedCart.items = populatedCart.items.map(item => ({
              ...item,
              productId: DB.products.find(p => String(p._id) === String(item.productId))
            }));
          }
          return { 
            lean: () => Promise.resolve(populatedCart),
            then: function(resolve) { resolve(populatedCart); }
          };
        },
        lean: () => Promise.resolve(cartDoc),
        then: function(resolve) { resolve(cartDoc); }
      };
    }),
    create: jest.fn().mockImplementation(async (data) => {
      const newCart = { _id: MOCK_CART_ID, ...data, save: async function() { Object.assign(newCart, this); } };
      DB.carts.push(newCart);
      return newCart;
    }),
    deleteOne: jest.fn().mockImplementation((query) => {
      DB.carts = DB.carts.filter(c => String(c.userId) !== String(query.userId));
      return Promise.resolve({ deletedCount: 1 });
    }),
  },
  Order: {
    create: jest.fn().mockImplementation(async (data) => {
      const newOrder = { 
        _id: MOCK_ORDER_ID, 
        ...data, 
        save: async function() { Object.assign(newOrder, this); },
        toJSON: function() { return this; }
      };
      DB.orders.push(newOrder);
      return newOrder;
    }),
    findById: jest.fn().mockImplementation((id) => {
      const order = DB.orders.find(o => String(o._id) === String(id));
      if (!order) {
        return {
          lean: () => Promise.resolve(null),
          then: function(resolve) { resolve(null); }
        };
      }
      
      const orderDoc = { 
        ...order, 
        save: async function() { 
          const idx = DB.orders.findIndex(o => String(o._id) === String(id));
          DB.orders[idx] = { ...this };
        }, 
        toJSON: function() { return this; } 
      };
      
      return {
        lean: () => Promise.resolve(orderDoc),
        then: function(resolve) { resolve(orderDoc); }
      };
    }),
    find: jest.fn().mockImplementation((query) => {
      const orders = DB.orders.filter(o => o.userId === query.userId);
      return { sort: () => ({ skip: () => ({ limit: () => ({ lean: () => Promise.resolve(orders) }) }) }) };
    }),
    countDocuments: jest.fn().mockResolvedValue(1),
  }
}));

// Load App
const { default: app } = await import('../../src/app.js');

describe('E2E Order Lifecycle', () => {
  let accessToken = '';
  let refreshToken = '';
  let orderId = '';

  test('1. POST /api/auth/signup', async () => {
    const res = await request(app).post('/api/auth/signup').send({
      name: 'E2E User',
      email: 'e2e@example.com',
      password: 'Password123!',
      phone: '9876543210'
    });
    expect(res.status).toBe(201);
  });

  test('2. POST /api/auth/login', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'e2e@example.com',
      password: 'Password123!'
    });
    expect(res.status).toBe(200);
    accessToken = res.body.data.accessToken;
    refreshToken = res.body.data.refreshToken;
  });

  test('3. POST /api/cart/add', async () => {
    const res = await request(app)
      .post('/api/cart/add')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ productId: MOCK_PROD_ID, qty: 2 });
    
    expect(res.status).toBe(200);
    expect(res.body.data.items[0].qty).toBe(2);
  });

  test('4. POST /api/orders (COD)', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        address: { street: '123 St', city: 'City', state: 'State', pincode: '123456' },
        paymentMode: 'COD'
      });
    
    expect(res.status).toBe(201);
    expect(res.body.data.paymentStatus).toBe('COD');
    expect(res.body.data.orderStatus).toBe('PLACED');
    orderId = res.body.data._id;
  });

  test('5. GET /api/cart (should be empty)', async () => {
    const res = await request(app)
      .get('/api/cart')
      .set('Authorization', `Bearer ${accessToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body.data).toBeNull();
  });

  test('6. GET /api/orders/:id', async () => {
    const res = await request(app)
      .get(`/api/orders/${orderId}`)
      .set('Authorization', `Bearer ${accessToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body.data._id).toBe(orderId);
  });

  test('7. POST /api/auth/logout', async () => {
    const res = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`);
    
    expect(res.status).toBe(200);
  });
});
