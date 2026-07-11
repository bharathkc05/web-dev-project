// server/src/modules/orders/payment.service.js
import Razorpay from 'razorpay';
import crypto from 'crypto';
import config from '../../config/env.js';
import logger from '../../shared/utils/logger.js';
import { ApiError } from '../../shared/utils/ApiError.js';

let razorpayInstance = null;

const getRazorpayInstance = () => {
  if (razorpayInstance) return razorpayInstance;

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret || keyId === 'your-razorpay-api-key' || keySecret === 'your-razorpay-key-secret') {
    logger.warn('Razorpay API keys (RAZORPAY_KEY_ID/RAZORPAY_KEY_SECRET) missing or default. Payment service running in MOCK mode.');
    return null;
  }

  try {
    razorpayInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
    return razorpayInstance;
  } catch (error) {
    logger.error('Failed to initialize Razorpay SDK', { message: error.message });
    return null;
  }
};

/**
 * Create a new Razorpay order
 * @param {number} amount - Amount in standard currency (e.g. INR)
 * @param {string} orderId - System internal Order ID
 * @returns {Promise<string>} - Razorpay Order ID
 */
export const createRazorpayOrder = async (amount, orderId) => {
  const instance = getRazorpayInstance();

  if (!instance) {
    // Generate a mock order ID
    const mockId = `order_mock_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    logger.info(`Mock Razorpay order generated: amount=${amount}, mockId=${mockId}`);
    return mockId;
  }

  try {
    const options = {
      amount: Math.round(amount * 100), // amount in paise (1 INR = 100 paise)
      currency: 'INR',
      receipt: String(orderId),
    };

    const order = await instance.orders.create(options);
    logger.info(`Razorpay order created: amount=${amount}, id=${order.id}`);
    return order.id;
  } catch (error) {
    logger.error('Razorpay order creation failed', { orderId, amount, message: error.message });
    throw error;
  }
};

/**
 * Verify Razorpay payment signature
 * @param {string} razorpayOrderId - Razorpay Order ID
 * @param {string} paymentId - Razorpay Payment ID
 * @param {string} signature - Razorpay SHA256 Signature
 * @returns {boolean} - true if signature is valid
 */
export const verifySignature = (razorpayOrderId, paymentId, signature) => {
  const instance = getRazorpayInstance();

  if (!instance) {
    if (config.NODE_ENV === 'production') {
      throw ApiError.internal('Payment gateway is not configured. Cannot verify payment.');
    }
    logger.info('Skipping Razorpay signature verification (mock mode — development only)');
    return true;
  }

  try {
    const secret = process.env.RAZORPAY_KEY_SECRET;
    const payload = `${razorpayOrderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    return expectedSignature === signature;
  } catch (error) {
    logger.error('Razorpay signature verification failed', { razorpayOrderId, paymentId, message: error.message });
    return false;
  }
};

/**
 * Initiate refund for an order
 * @param {string} paymentId - Razorpay Payment ID
 * @param {number} amount - Amount to refund in standard currency
 * @returns {Promise<Object>} - Razorpay refund result object
 */
export const initiateRefund = async (paymentId, amount) => {
  const instance = getRazorpayInstance();

  if (!instance) {
    logger.info(`Mocking refund: paymentId=${paymentId}, amount=${amount}`);
    return { status: 'refunded', amount_refunded: amount, mock: true };
  }

  try {
    const refund = await instance.payments.refund(paymentId, {
      amount: Math.round(amount * 100), // paise
    });
    logger.info(`Refund initiated on Razorpay: paymentId=${paymentId}, amount=${amount}, refundId=${refund.id}`);
    return refund;
  } catch (error) {
    logger.error('Razorpay refund initiation failed', { paymentId, amount, message: error.message });
    throw error;
  }
};

export default {
  createRazorpayOrder,
  verifySignature,
  initiateRefund,
};
