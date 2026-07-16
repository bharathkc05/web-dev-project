// server/src/modules/orders/order.model.js
import mongoose from 'mongoose';
import { ORDER_STATUS } from '../../shared/constants/orderStatuses.js';
import { PAYMENT_STATUS } from '../../shared/constants/paymentStatuses.js';

// ==========================================
// 1. ORDER MODEL
// ==========================================
const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  qty: {
    type: Number,
    required: true,
    min: 1,
  },
});

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    outletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Outlet',
      required: true,
      index: true,
    },
    items: [orderItemSchema],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    tax: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    discount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    paymentMode: {
      type: String,
      required: true,
      enum: ['UPI', 'CARD', 'NETBANKING', 'COD', 'ONLINE'],
    },
    orderStatus: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.PLACED,
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING,
      index: true,
    },
    razorpayOrderId: {
      type: String,
      default: null,
    },
    razorpayPaymentId: {
      type: String,
      default: null,
    },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
    },
    instructions: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Indexes
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ outletId: 1, orderStatus: 1 });

export const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

// ==========================================
// 2. CART MODEL
// ==========================================
const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  qty: {
    type: Number,
    required: true,
    min: 1,
  },
});

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    outletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Outlet',
      default: null,
    },
    items: [cartItemSchema],
  },
  { timestamps: true }
);

// TTL Index: Auto-delete carts after 7 days of inactivity (updatedAt)
cartSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 7 * 24 * 60 * 60 });

export const Cart = mongoose.models.Cart || mongoose.model('Cart', cartSchema);

export default {
  Order,
  Cart,
};
