import { jest } from '@jest/globals';

const mockFindOrder = jest.fn();
const mockFindByIdOrder = jest.fn();
const mockCreateOrder = jest.fn();
const mockCountDocumentsOrder = jest.fn();

const mockFindOneCart = jest.fn();
const mockCreateCart = jest.fn();
const mockDeleteOneCart = jest.fn();

const mockFindByIdProduct = jest.fn();
const mockFindByIdAndUpdateProduct = jest.fn();

const mockValidateOffer = jest.fn();

const mockCreateRazorpayOrder = jest.fn();
const mockVerifySignature = jest.fn();
const mockInitiateRefund = jest.fn();

const mockEmitToRoom = jest.fn();
const mockPushBullMQJob = jest.fn().mockResolvedValue(true);

// Mock Mongoose models
jest.unstable_mockModule('../../src/modules/orders/order.model.js', () => ({
  Order: {
    find: mockFindOrder,
    findById: mockFindByIdOrder,
    create: mockCreateOrder,
    countDocuments: mockCountDocumentsOrder,
  },
  Cart: {
    findOne: mockFindOneCart,
    create: mockCreateCart,
    deleteOne: mockDeleteOneCart,
  },
}));

jest.unstable_mockModule('../../src/modules/products/product.model.js', () => ({
  Product: {
    findById: mockFindByIdProduct,
    findByIdAndUpdate: mockFindByIdAndUpdateProduct,
  },
}));

jest.unstable_mockModule('../../src/modules/products/offer.service.js', () => ({
  validateAndUseOffer: mockValidateOffer,
  calculateDiscount: jest.fn().mockReturnValue(0),
}));

jest.unstable_mockModule('../../src/modules/orders/payment.service.js', () => ({
  createRazorpayOrder: mockCreateRazorpayOrder,
  verifySignature: mockVerifySignature,
  initiateRefund: mockInitiateRefund,
}));

jest.unstable_mockModule('../../src/shared/utils/socketManager.js', () => ({
  emitToRoom: mockEmitToRoom,
}));

jest.unstable_mockModule('../../src/modules/orders/order.worker.js', () => ({
  pushBullMQJob: mockPushBullMQJob,
  initOrderWorker: jest.fn(),
}));

const {
  addToCart,
  getCart,
  removeFromCart,
  placeOrder,
  verifyPayment,
  updateOrderStatus,
  getOrders,
  getOrderById,
} = await import('../../src/modules/orders/order.service.js');

// Valid 24-character ObjectIds
const MOCK_USER_ID = '60c72b2f9b1d8a2c148b4569';
const MOCK_OUTLET_ID = '60c72b2f9b1d8a2c148b4567';
const MOCK_PRODUCT_ID = '60c72b2f9b1d8a2c148b4568';
const MOCK_ORDER_ID = '60c72b2f9b1d8a2c148b456a';

const createTestProduct = (overrides = {}) => ({
  _id: MOCK_PRODUCT_ID,
  outletId: MOCK_OUTLET_ID,
  masterProductId: { name: 'Burger' },
  price: 5.99,
  isAvailable: true,
  ...overrides,
});

const createTestCart = (overrides = {}) => {
  const cart = {
    userId: MOCK_USER_ID,
    outletId: MOCK_OUTLET_ID,
    items: [{ productId: MOCK_PRODUCT_ID, qty: 2 }],
    save: jest.fn().mockResolvedValue(true),
    ...overrides,
  };
  cart.save = cart.save || jest.fn().mockResolvedValue(true);
  return cart;
};

const createTestOrder = (overrides = {}) => ({
  _id: MOCK_ORDER_ID,
  userId: MOCK_USER_ID,
  outletId: MOCK_OUTLET_ID,
  items: [{ productId: MOCK_PRODUCT_ID, name: 'Burger', price: 5.99, qty: 2 }],
  totalAmount: 12.58,
  tax: 0.60,
  discount: 0,
  paymentMode: 'UPI',
  orderStatus: 'PLACED',
  paymentStatus: 'PENDING',
  razorpayOrderId: 'rzp-order-1',
  razorpayPaymentId: null,
  address: { street: '123 St', city: 'City', state: 'State', pincode: '123456' },
  save: jest.fn().mockResolvedValue(true),
  toJSON() {
    const { save, toJSON, ...rest } = this;
    return rest;
  },
  ...overrides,
});

describe('order.service unit tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('addToCart', () => {
    test('creates a cart if none exists', async () => {
      mockFindByIdProduct.mockResolvedValue(createTestProduct());
      
      const newCart = createTestCart();
      mockCreateCart.mockResolvedValue(newCart);
      
      mockFindOneCart
        .mockReturnValueOnce(null) // first check: cart not found
        .mockReturnValueOnce({ populate: jest.fn().mockResolvedValue(newCart) }); // second return populated

      const result = await addToCart(MOCK_USER_ID, MOCK_PRODUCT_ID, 2);

      expect(mockFindByIdProduct).toHaveBeenCalledWith(MOCK_PRODUCT_ID);
      expect(mockCreateCart).toHaveBeenCalledWith({
        userId: MOCK_USER_ID,
        outletId: MOCK_OUTLET_ID,
        items: [{ productId: MOCK_PRODUCT_ID, qty: 2 }],
      });
      expect(result).toEqual(newCart);
    });

    test('throws bad request if item from different outlet is added', async () => {
      mockFindByIdProduct.mockResolvedValue(createTestProduct({ outletId: '60c72b2f9b1d8a2c148b456f' }));
      mockFindOneCart.mockReturnValue(createTestCart({ outletId: MOCK_OUTLET_ID }));

      await expect(addToCart(MOCK_USER_ID, MOCK_PRODUCT_ID, 2)).rejects.toMatchObject({
        statusCode: 400,
        message: 'Cannot add items from a different outlet to your cart. Clear your cart first.',
      });
    });
  });

  describe('removeFromCart', () => {
    test('removes item and saves cart', async () => {
      const cart = createTestCart({
        items: [{ productId: MOCK_PRODUCT_ID, qty: 2 }, { productId: '60c72b2f9b1d8a2c148b456f', qty: 1 }],
      });
      
      mockFindOneCart
        .mockReturnValueOnce(cart)
        .mockReturnValueOnce({ populate: jest.fn().mockResolvedValue(cart) });

      const result = await removeFromCart(MOCK_USER_ID, MOCK_PRODUCT_ID);

      expect(cart.save).toHaveBeenCalled();
      expect(cart.items.length).toBe(1);
      expect(result).toEqual(cart);
    });

    test('deletes cart if last item is removed', async () => {
      const cart = createTestCart({
        items: [{ productId: MOCK_PRODUCT_ID, qty: 2 }],
      });
      mockFindOneCart.mockReturnValueOnce(cart);
      mockDeleteOneCart.mockResolvedValue({ deletedCount: 1 });

      const result = await removeFromCart(MOCK_USER_ID, MOCK_PRODUCT_ID);

      expect(mockDeleteOneCart).toHaveBeenCalledWith({ userId: MOCK_USER_ID });
      expect(result).toBeNull();
    });
  });

  describe('placeOrder', () => {
    test('creates order and triggers Razorpay if online mode', async () => {
      const product = createTestProduct();
      
      const cart = {
        items: [{ productId: product, qty: 2 }],
        outletId: MOCK_OUTLET_ID,
      };
      
      mockFindOneCart.mockReturnValue({
        populate: jest.fn().mockResolvedValue(cart),
      });

      const order = createTestOrder({ totalAmount: 12.58, tax: 0.60 });
      mockCreateOrder.mockResolvedValue(order);
      mockCreateRazorpayOrder.mockResolvedValue('rzp-order-1');

      const result = await placeOrder(
        MOCK_USER_ID,
        { street: '123 St', city: 'City', state: 'State', pincode: '123456' },
        'instructions',
        'UPI'
      );

      expect(mockCreateOrder).toHaveBeenCalled();
      expect(mockCreateRazorpayOrder).toHaveBeenCalledWith(12.58, order._id);
      expect(order.save).toHaveBeenCalled();
      expect(result._id).toBe(MOCK_ORDER_ID);
    });

    test('creates order and completes immediately if COD mode', async () => {
      const product = createTestProduct();
      
      const cart = {
        items: [{ productId: product, qty: 2 }],
        outletId: MOCK_OUTLET_ID,
      };
      mockFindOneCart.mockReturnValue({
        populate: jest.fn().mockResolvedValue(cart),
      });

      const order = createTestOrder({ paymentMode: 'COD', paymentStatus: 'COD' });
      mockCreateOrder.mockResolvedValue(order);

      const result = await placeOrder(
        MOCK_USER_ID,
        { street: '123 St', city: 'City', state: 'State', pincode: '123456' },
        'instructions',
        'COD'
      );

      expect(mockCreateOrder).toHaveBeenCalled();
      expect(mockCreateRazorpayOrder).not.toHaveBeenCalled();
      expect(mockDeleteOneCart).toHaveBeenCalledWith({ userId: MOCK_USER_ID });
      expect(mockPushBullMQJob).toHaveBeenCalledWith(order._id, 'ORDER_CONFIRMED');
      expect(mockEmitToRoom).toHaveBeenCalledWith(MOCK_OUTLET_ID, 'ORDER_CREATED', order.toJSON());
      expect(result.paymentStatus).toBe('COD');
    });
  });

  describe('verifyPayment', () => {
    test('finalizes order on valid payment signature verification', async () => {
      const order = createTestOrder();
      mockFindByIdOrder.mockResolvedValue(order);
      mockVerifySignature.mockReturnValue(true);

      const result = await verifyPayment(MOCK_ORDER_ID, MOCK_USER_ID, {
        razorpay_payment_id: 'pay-1',
        razorpay_order_id: 'rzp-order-1',
        razorpay_signature: 'sig-1',
      });

      expect(mockVerifySignature).toHaveBeenCalledWith('rzp-order-1', 'pay-1', 'sig-1');
      expect(order.paymentStatus).toBe('PAID');
      expect(order.orderStatus).toBe('ACCEPTED');
      expect(mockDeleteOneCart).toHaveBeenCalledWith({ userId: MOCK_USER_ID });
      expect(mockPushBullMQJob).toHaveBeenCalledWith(MOCK_ORDER_ID, 'ORDER_CONFIRMED');
      expect(mockEmitToRoom).toHaveBeenCalledWith(MOCK_OUTLET_ID, 'ORDER_CREATED', order.toJSON());
      expect(result.paymentStatus).toBe('PAID');
    });

    test('cancels order on failed verification', async () => {
      const order = createTestOrder();
      mockFindByIdOrder.mockResolvedValue(order);
      mockVerifySignature.mockReturnValue(false);

      await expect(verifyPayment(MOCK_ORDER_ID, MOCK_USER_ID, {
        razorpay_payment_id: 'pay-1',
        razorpay_order_id: 'rzp-order-1',
        razorpay_signature: 'sig-1',
      })).rejects.toMatchObject({
        statusCode: 400,
        message: 'Payment verification failed',
      });

      expect(order.paymentStatus).toBe('FAILED');
      expect(order.orderStatus).toBe('CANCELLED');
    });
  });

  describe('updateOrderStatus', () => {
    test('updates status and pushes refund if paid order is cancelled', async () => {
      const order = createTestOrder({ orderStatus: 'ACCEPTED', paymentStatus: 'PAID', razorpayPaymentId: 'pay-1' });
      mockFindByIdOrder.mockResolvedValue(order);

      const manager = { role: 'OUTLET_MANAGER', outletId: MOCK_OUTLET_ID };
      const result = await updateOrderStatus(MOCK_ORDER_ID, 'CANCELLED', manager);

      expect(mockInitiateRefund).toHaveBeenCalledWith('pay-1', 12.58);
      expect(order.orderStatus).toBe('CANCELLED');
      expect(order.paymentStatus).toBe('REFUNDED');
      expect(mockEmitToRoom).toHaveBeenCalledTimes(4); // Specific events + generic events for manager and customer
      expect(result.orderStatus).toBe('CANCELLED');
    });

    test('throws forbidden for mismatched outlet managers', async () => {
      const order = createTestOrder({ orderStatus: 'ACCEPTED' });
      mockFindByIdOrder.mockResolvedValue(order);

      const manager = { role: 'OUTLET_MANAGER', outletId: '60c72b2f9b1d8a2c148b456f' };
      
      await expect(updateOrderStatus(MOCK_ORDER_ID, 'PREPARING', manager)).rejects.toMatchObject({
        statusCode: 403,
        message: 'You do not have permission to update orders for this outlet',
      });
    });

    test('throws bad request for invalid status transitions', async () => {
      const order = createTestOrder({ orderStatus: 'DELIVERED' });
      mockFindByIdOrder.mockResolvedValue(order);

      const manager = { role: 'OUTLET_MANAGER', outletId: MOCK_OUTLET_ID };

      await expect(updateOrderStatus(MOCK_ORDER_ID, 'PREPARING', manager)).rejects.toMatchObject({
        statusCode: 400,
        message: 'Invalid order transition from DELIVERED to PREPARING',
      });
    });
  });
});
