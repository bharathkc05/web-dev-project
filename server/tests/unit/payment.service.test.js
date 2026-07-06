import { jest } from '@jest/globals';
import crypto from 'crypto';

// Setup environment variables before loading the payment service to enable signature validation logic
process.env.RAZORPAY_KEY_ID = 'rzp_test_1234567890';
process.env.RAZORPAY_KEY_SECRET = 'test_secret_1234567890';

const { verifySignature } = await import('../../src/modules/orders/payment.service.js');

describe('payment.service verifySignature tests', () => {
  const orderId = 'order_id_123';
  const paymentId = 'pay_id_456';
  const payload = `${orderId}|${paymentId}`;

  test('returns true for a valid signature matching expected HMAC-SHA256 hash', () => {
    // Generate valid HMAC using the secret
    const validSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(payload)
      .digest('hex');

    const isValid = verifySignature(orderId, paymentId, validSignature);
    expect(isValid).toBe(true);
  });

  test('returns false for an altered/modified signature hash', () => {
    const validSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(payload)
      .digest('hex');

    // Alter the signature by changing one character
    const alteredSignature = validSignature.substring(0, validSignature.length - 1) + 'x';

    const isValid = verifySignature(orderId, paymentId, alteredSignature);
    expect(isValid).toBe(false);
  });

  test('returns false for an empty/blank signature', () => {
    const isValid = verifySignature(orderId, paymentId, '');
    expect(isValid).toBe(false);
  });
});
