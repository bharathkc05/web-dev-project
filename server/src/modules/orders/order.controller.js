// server/src/modules/orders/order.controller.js
import * as orderService from './order.service.js';
import { ApiResponse } from '../../shared/utils/ApiResponse.js';

export const addToCart = async (req, res, next) => {
  try {
    const { productId, qty } = req.body;
    const result = await orderService.addToCart(req.user.userId, productId, Number(qty));
    res.status(200).json(ApiResponse.ok(result, 'Cart updated successfully'));
  } catch (error) {
    next(error);
  }
};

export const getCart = async (req, res, next) => {
  try {
    const result = await orderService.getCart(req.user.userId);
    res.status(200).json(ApiResponse.ok(result, 'Cart fetched successfully'));
  } catch (error) {
    next(error);
  }
};

export const removeFromCart = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await orderService.removeFromCart(req.user.userId, id);
    res.status(200).json(ApiResponse.ok(result, 'Item removed from cart'));
  } catch (error) {
    next(error);
  }
};

export const placeOrder = async (req, res, next) => {
  console.log('CONTROLLER placeOrder hit', req.body);
  try {
    const { address, instructions, paymentMode, couponCode, mockItems } = req.body;
    const result = await orderService.placeOrder(
      req.user.userId,
      address,
      instructions,
      paymentMode,
      couponCode,
      mockItems
    );
    console.log('CONTROLLER placeOrder success', result?._id);
    res.status(201).json(ApiResponse.created(result, 'Order placed successfully'));
  } catch (error) {
    console.error('CONTROLLER placeOrder error', error);
    next(error);
  }
};

export const verifyPayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await orderService.verifyPayment(id, req.user.userId, req.body);
    res.status(200).json(ApiResponse.ok(result, 'Payment verified and order finalized'));
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const result = await orderService.updateOrderStatus(id, status, req.user);
    res.status(200).json(ApiResponse.ok(result, 'Order status updated successfully'));
  } catch (error) {
    next(error);
  }
};

export const getOrders = async (req, res, next) => {
  try {
    const { page, limit, ...filters } = req.query;
    const result = await orderService.getOrders(
      req.user,
      filters,
      Number(page || 1),
      Number(limit || 20)
    );
    res.status(200).json(ApiResponse.ok(result, 'Orders fetched successfully'));
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await orderService.getOrderById(id, req.user);
    res.status(200).json(ApiResponse.ok(result, 'Order details fetched successfully'));
  } catch (error) {
    next(error);
  }
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
