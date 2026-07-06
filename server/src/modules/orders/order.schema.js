// server/src/modules/orders/order.schema.js
import { z } from 'zod';

const objectIdSchema = z.string().trim().regex(/^[a-fA-F0-9]{24}$/, 'Invalid id');

export const addToCartSchema = z.object({
  productId: objectIdSchema,
  qty: z.coerce.number().int().positive('Quantity must be a positive integer'),
});

export const placeOrderSchema = z.object({
  address: z.object({
    street: z.string().trim().min(1, 'Street is required'),
    city: z.string().trim().min(1, 'City is required'),
    state: z.string().trim().min(1, 'State is required'),
    pincode: z.string().trim().regex(/^\d{6}$/, 'Pincode must be exactly 6 digits'),
  }),
  instructions: z.string().trim().max(300).optional().default(''),
  paymentMode: z.enum(['UPI', 'CARD', 'NETBANKING', 'COD'], {
    errorMap: () => ({ message: 'Payment mode must be UPI, CARD, NETBANKING, or COD' }),
  }),
  couponCode: z.string().trim().toUpperCase().optional(),
});

export const verifyPaymentSchema = z.object({
  razorpay_payment_id: z.string().trim().min(1, 'Payment ID is required'),
  razorpay_order_id: z.string().trim().min(1, 'Order ID is required'),
  razorpay_signature: z.string().trim().min(1, 'Signature is required'),
});

export const updateStatusSchema = z.object({
  status: z.enum(['ACCEPTED', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED'], {
    errorMap: () => ({ message: 'Invalid order status transition target' }),
  }),
});

export const idParamSchema = z.object({
  id: objectIdSchema,
});
