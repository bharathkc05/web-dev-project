// server/tests/unit/schema.test.js
import { signupSchema, loginSchema } from '../../src/modules/auth/auth.schema.js';
import { addToCartSchema, placeOrderSchema, verifyPaymentSchema, updateStatusSchema } from '../../src/modules/orders/order.schema.js';
import { productFilterSchema } from '../../src/modules/products/product.schema.js';

describe('schema unit tests', () => {
  describe('auth schemas', () => {
    test('signupSchema validates correct input', () => {
      const data = { name: 'Test', email: 'test@example.com', password: 'Password1!', phone: '1234567890' };
      const res = signupSchema.safeParse(data);
      expect(res.success).toBe(true);
    });

    test('signupSchema rejects invalid email', () => {
      const data = { name: 'Test', email: 'invalid', password: 'Password1!', phone: '1234567890' };
      const res = signupSchema.safeParse(data);
      expect(res.success).toBe(false);
    });

    test('signupSchema rejects weak password', () => {
      const data = { name: 'Test', email: 'test@example.com', password: 'weak', phone: '1234567890' };
      const res = signupSchema.safeParse(data);
      expect(res.success).toBe(false);
    });

    test('loginSchema validates correct input', () => {
      const res = loginSchema.safeParse({ email: 'test@example.com', password: 'pwd' });
      expect(res.success).toBe(true);
    });
  });

  describe('order schemas', () => {
    test('addToCartSchema validates correct input', () => {
      const res = addToCartSchema.safeParse({ productId: '507f1f77bcf86cd799439011', qty: 2 });
      expect(res.success).toBe(true);
    });

    test('addToCartSchema rejects negative qty', () => {
      const res = addToCartSchema.safeParse({ productId: '507f1f77bcf86cd799439011', qty: -1 });
      expect(res.success).toBe(false);
    });

    test('placeOrderSchema validates correct input', () => {
      const data = {
        address: { street: '123 St', city: 'City', state: 'State', pincode: '123456' },
        paymentMode: 'UPI',
        instructions: '<script>alert(1)</script> leave at door'
      };
      const res = placeOrderSchema.safeParse(data);
      expect(res.success).toBe(true);
      // Ensure XSS is stripped
      expect(res.data.instructions).toBe('alert(1) leave at door');
    });

    test('placeOrderSchema rejects invalid pincode', () => {
      const data = {
        address: { street: '123 St', city: 'City', state: 'State', pincode: '123' },
        paymentMode: 'UPI'
      };
      const res = placeOrderSchema.safeParse(data);
      expect(res.success).toBe(false);
    });

    test('verifyPaymentSchema validates correct input', () => {
      const res = verifyPaymentSchema.safeParse({
        razorpay_payment_id: 'pay_1',
        razorpay_order_id: 'order_1',
        razorpay_signature: 'sig_1'
      });
      expect(res.success).toBe(true);
    });

    test('updateStatusSchema rejects invalid status', () => {
      const res = updateStatusSchema.safeParse({ status: 'INVALID' });
      expect(res.success).toBe(false);
    });
  });

  describe('product schemas', () => {
    test('productFilterSchema caps limit at 100', () => {
      const res = productFilterSchema.safeParse({ limit: 500 });
      expect(res.success).toBe(false);
    });

    test('productFilterSchema validates proper limit and parses booleans', () => {
      const res = productFilterSchema.safeParse({ limit: 50, isAvailable: 'true' });
      expect(res.success).toBe(true);
      expect(res.data.limit).toBe(50);
      expect(res.data.isAvailable).toBe(true);
    });
  });
});
