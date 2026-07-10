// server/src/modules/orders/order.service.js
import mongoose from 'mongoose';
import { Order, Cart } from './order.model.js';
import { Product } from '../products/product.model.js';
import Outlet from '../../shared/models/outlet.model.js';
import { validateOffer, calculateDiscount } from '../products/offer.service.js';
import { createRazorpayOrder, verifySignature, initiateRefund } from './payment.service.js';
import { ApiError } from '../../shared/utils/ApiError.js';
import { emitToRoom } from '../../shared/utils/socketManager.js';
import { SOCKET_EVENTS } from '../../shared/events/socketEvents.js';
import { ORDER_STATUS, VALID_TRANSITIONS } from '../../shared/constants/orderStatuses.js';
import { PAYMENT_STATUS } from '../../shared/constants/paymentStatuses.js';
import { ROLES } from '../../shared/constants/roles.js';
import { pushBullMQJob } from './order.worker.js';

/**
 * Add items to cart (upsert item, validate single-outlet)
 */
export const addToCart = async (userId, productId, qty) => {
  const product = await Product.findById(productId);
  if (!product || !product.isAvailable) {
    throw ApiError.notFound('Product not found or unavailable');
  }

  let cart = await Cart.findOne({ userId });

  if (!cart) {
    // Create new cart
    cart = await Cart.create({
      userId,
      outletId: product.outletId,
      items: [{ productId, qty }],
    });
  } else {
    // Single-outlet validation
    if (cart.outletId && String(cart.outletId) !== String(product.outletId)) {
      throw ApiError.badRequest(
        'Cannot add items from a different outlet to your cart. Clear your cart first.'
      );
    }

    // Set outlet ID if cart was empty
    if (!cart.outletId) {
      cart.outletId = product.outletId;
    }

    const itemIndex = cart.items.findIndex((item) => String(item.productId) === String(productId));

    if (itemIndex > -1) {
      if (qty <= 0) {
        cart.items.splice(itemIndex, 1);
      } else {
        cart.items[itemIndex].qty = qty;
      }
    } else if (qty > 0) {
      cart.items.push({ productId, qty });
    }

    if (cart.items.length === 0) {
      await Cart.deleteOne({ userId });
      return null;
    }

    await cart.save();
  }

  // Populate product details
  return Cart.findOne({ userId }).populate('items.productId');
};

/**
 * Get active cart for user
 */
export const getCart = async (userId) => {
  return Cart.findOne({ userId }).populate('items.productId').lean();
};

/**
 * Remove product item from cart
 */
export const removeFromCart = async (userId, productId) => {
  const cart = await Cart.findOne({ userId });
  if (!cart) {
    throw ApiError.notFound('Cart is empty');
  }

  const itemIndex = cart.items.findIndex((item) => String(item.productId) === String(productId));

  if (itemIndex === -1) {
    throw ApiError.notFound('Item not found in cart');
  }

  cart.items.splice(itemIndex, 1);

  if (cart.items.length === 0) {
    await Cart.deleteOne({ userId });
    return null;
  }

  await cart.save();

  return Cart.findOne({ userId }).populate('items.productId');
};

/**
 * Place a new Order
 */
export const placeOrder = async (userId, address, instructions, paymentMode, couponCode = null, mockItems = null) => {
  console.log('placeOrder START', { userId, paymentMode });
  let cart;
  
  if (mockItems && mockItems.length > 0) {
    console.log('Using mockItems bypass');
    cart = {
      userId,
      outletId: mockItems[0].outletId, 
      items: mockItems
    };
    
    for (let i = 0; i < cart.items.length; i++) {
      console.log('Fetching product for item', i, cart.items[i].productId);
      const product = await Product.findById(cart.items[i].productId).populate('masterProductId');
      cart.items[i].productId = product;
    }
  } else {
    console.log('Fetching cart from DB');
    cart = await Cart.findOne({ userId }).populate({
      path: 'items.productId',
      populate: { path: 'masterProductId' }
    });
  }

  if (!cart || cart.items.length === 0) {
    throw ApiError.badRequest('Your cart is empty');
  }
  
  const orderItems = [];
  let subtotal = 0;

  for (const item of cart.items) {
    const product = item.productId;
    if (!product || !product.isAvailable) {
      throw ApiError.badRequest(`Product ${product?.masterProductId?.name || 'Unknown'} is currently unavailable`);
    }

    orderItems.push({
      productId: product._id,
      name: product.masterProductId?.name || 'Unknown Product',
      price: product.price,
      qty: item.qty,
    });

    subtotal += product.price * item.qty;
  }

  let discount = 0;
  if (couponCode) {
    const offer = await validateOffer(couponCode, cart.outletId, subtotal);
    discount = calculateDiscount(offer, cart.items, subtotal);
  }

  const tax = (subtotal - discount) * 0.05; 
  const totalAmount = subtotal - discount + tax;

  console.log('Creating order document in DB');
  const order = await Order.create({
    userId,
    outletId: cart.outletId,
    items: orderItems,
    totalAmount: Math.round(totalAmount * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    discount: Math.round(discount * 100) / 100,
    paymentMode,
    orderStatus: ORDER_STATUS.PLACED,
    paymentStatus: paymentMode === 'COD' ? PAYMENT_STATUS.COD : PAYMENT_STATUS.PENDING,
    address,
    instructions,
  });

  if (paymentMode === 'COD') {
    console.log('Deleting cart');
    await Cart.deleteOne({ userId });

    console.log('Pushing to bullmq');
    pushBullMQJob(order._id, 'ORDER_CONFIRMED').catch(e => console.error('BullMQ Error:', e));
    console.log('Emitting socket');
    emitToRoom(String(order.outletId), SOCKET_EVENTS.ORDER_CREATED, order.toJSON());
  } else {
    const rzpOrderId = await createRazorpayOrder(order.totalAmount, order._id);
    order.razorpayOrderId = rzpOrderId;
    await order.save();
  }

  console.log('placeOrder END');
  return order.toJSON();
};

/**
 * Verify Razorpay payment signature
 */
export const verifyPayment = async (orderId, userId, razorpayData) => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = razorpayData;

  const order = await Order.findById(orderId);
  if (!order) {
    throw ApiError.notFound('Order not found');
  }

  if (order.paymentStatus !== PAYMENT_STATUS.PENDING) {
    throw ApiError.badRequest('This order has already been processed or is not pending');
  }

  const isValid = verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);

  if (isValid) {
    order.paymentStatus = PAYMENT_STATUS.PAID;
    order.orderStatus = ORDER_STATUS.ACCEPTED;
    order.razorpayPaymentId = razorpay_payment_id;
    await order.save();

    // Clear cart
    await Cart.deleteOne({ userId });

    // Queue worker job
    await pushBullMQJob(order._id, 'ORDER_CONFIRMED');

    // Notify Outlet
    emitToRoom(String(order.outletId), SOCKET_EVENTS.ORDER_CREATED, order.toJSON());

    return order.toJSON();
  } else {
    order.paymentStatus = PAYMENT_STATUS.FAILED;
    order.orderStatus = ORDER_STATUS.CANCELLED;
    await order.save();

    throw ApiError.badRequest('Payment verification failed');
  }
};

/**
 * Update order lifecycle status (with validation transitions & refunds)
 */
export const updateOrderStatus = async (orderId, status, user) => {
  const order = await Order.findById(orderId);
  if (!order) {
    throw ApiError.notFound('Order not found');
  }

  // Ownership verification
  if (user.role !== ROLES.ADMIN && String(user.outletId) !== String(order.outletId)) {
    throw ApiError.forbidden('You do not have permission to update orders for this outlet');
  }

  // Validate state transitions
  const allowed = VALID_TRANSITIONS[order.orderStatus] || [];
  if (!allowed.includes(status)) {
    throw ApiError.badRequest(`Invalid order transition from ${order.orderStatus} to ${status}`);
  }

  // Handle Cancellation & Refunds
  if (status === ORDER_STATUS.CANCELLED) {
    if (order.paymentStatus === PAYMENT_STATUS.PAID) {
      await initiateRefund(order.razorpayPaymentId, order.totalAmount);
      order.paymentStatus = PAYMENT_STATUS.REFUNDED;
    }
  }

  order.orderStatus = status;
  await order.save();

  // Notify socket rooms
  const orderJSON = order.toJSON();
  const socketEvent = SOCKET_EVENTS[`ORDER_${status}`];
  if (socketEvent) {
    emitToRoom(String(order.outletId), socketEvent, orderJSON);
    emitToRoom(String(order.userId), socketEvent, orderJSON);
  }
  emitToRoom(String(order.outletId), 'ORDER_STATUS_UPDATED', orderJSON);
  emitToRoom(String(order.userId), 'ORDER_STATUS_UPDATED', orderJSON);

  return orderJSON;
};

/**
 * Fetch scoped paged list of orders
 */
export const getOrders = async (user, filters = {}, page = 1, limit = 20) => {
  const query = {};

  // Scoping filters by role boundaries
  if (user.role === ROLES.CUSTOMER) {
    query.userId = user.userId;
  } else if (user.role === ROLES.OUTLET_MANAGER) {
    query.outletId = user.outletId;
  } else if (user.role === ROLES.ADMIN && filters.outletId) {
    query.outletId = filters.outletId;
  }
  
  console.log('getOrders query:', query, 'user role:', user.role);

  if (filters.orderStatus) {
    query.orderStatus = filters.orderStatus;
  }

  if (filters.paymentStatus) {
    query.paymentStatus = filters.paymentStatus;
  }

  const items = await Order.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  const total = await Order.countDocuments(query);

  return {
    items,
    pageInfo: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Fetch a single order by ID with ownership checks
 */
export const getOrderById = async (orderId, user) => {
  const order = await Order.findById(orderId).lean();
  if (!order) {
    throw ApiError.notFound('Order not found');
  }

  // Scoping validations
  if (user.role === ROLES.CUSTOMER && String(order.userId) !== String(user.userId)) {
    throw ApiError.forbidden('You do not have permission to view this order');
  }

  if (user.role === ROLES.OUTLET_MANAGER && String(order.outletId) !== String(user.outletId)) {
    throw ApiError.forbidden('You do not have permission to view orders for this outlet');
  }

  return order;
};
export default {
  addToCart,
  getCart,
  removeFromCart,
  placeOrder,
  verifyPayment,
  updateOrderStatus,
  getOrders,
  getOrderById,
};
