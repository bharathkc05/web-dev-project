// server/src/modules/orders/order.controller.js
import * as orderService from './order.service.js';
import { ApiResponse } from '../../shared/utils/ApiResponse.js';

export const addToCart = async (req, res) => {
  const { productId, qty } = req.body;
  const result = await orderService.addToCart(req.user.userId, productId, Number(qty));
  res.status(200).json(ApiResponse.ok(result, 'Cart updated successfully'));
};

export const getCart = async (req, res) => {
  const result = await orderService.getCart(req.user.userId);
  res.status(200).json(ApiResponse.ok(result, 'Cart fetched successfully'));
};

export const removeFromCart = async (req, res) => {
  const { id } = req.params;
  const result = await orderService.removeFromCart(req.user.userId, id);
  res.status(200).json(ApiResponse.ok(result, 'Item removed from cart'));
};

export const placeOrder = async (req, res) => {
  const { address, instructions, paymentMode, couponCode } = req.body;
  const result = await orderService.placeOrder(
    req.user.userId,
    address,
    instructions,
    paymentMode,
    couponCode
  );
  res.status(201).json(ApiResponse.created(result, 'Order placed successfully'));
};

export const verifyPayment = async (req, res) => {
  const { id } = req.params;
  const result = await orderService.verifyPayment(id, req.user.userId, req.body);
  res.status(200).json(ApiResponse.ok(result, 'Payment verified and order finalized'));
};

export const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const result = await orderService.updateOrderStatus(id, status, req.user);
  res.status(200).json(ApiResponse.ok(result, 'Order status updated successfully'));
};

export const getOrders = async (req, res) => {
  const { page, limit, ...filters } = req.query;
  const result = await orderService.getOrders(
    req.user,
    filters,
    Number(page || 1),
    Number(limit || 20)
  );
  res.status(200).json(ApiResponse.ok(result, 'Orders fetched successfully'));
};

export const getOrderById = async (req, res) => {
  const { id } = req.params;
  const result = await orderService.getOrderById(id, req.user);
  res.status(200).json(ApiResponse.ok(result, 'Order details fetched successfully'));
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
