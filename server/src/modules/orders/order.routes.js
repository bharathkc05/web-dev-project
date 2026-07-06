// server/src/modules/orders/order.routes.js
import { Router } from 'express';
import {
  addToCart,
  getCart,
  removeFromCart,
  placeOrder,
  verifyPayment,
  updateOrderStatus,
  getOrders,
  getOrderById,
} from './order.controller.js';
import {
  addToCartSchema,
  placeOrderSchema,
  verifyPaymentSchema,
  updateStatusSchema,
  idParamSchema,
} from './order.schema.js';
import authenticate from '../../shared/middleware/authenticate.js';
import authorize from '../../shared/middleware/authorize.js';
import { validateRequest, validateParams } from '../../shared/middleware/validate.js';
import asyncHandler from '../../shared/middleware/asyncHandler.js';
import { ROLES } from '../../shared/constants/roles.js';

const router = Router();

const customerOnly = [authenticate, authorize(ROLES.CUSTOMER)];
const managerOrAdmin = [authenticate, authorize(ROLES.OUTLET_MANAGER, ROLES.ADMIN)];

// Cart Operations (Customer Scoped)
router.post(
  '/cart/add',
  ...customerOnly,
  validateRequest(addToCartSchema),
  asyncHandler(addToCart)
);

router.get(
  '/cart',
  ...customerOnly,
  asyncHandler(getCart)
);

router.delete(
  '/cart/item/:id',
  ...customerOnly,
  validateParams(idParamSchema),
  asyncHandler(removeFromCart)
);

// Order Operations
router.post(
  '/orders',
  ...customerOnly,
  validateRequest(placeOrderSchema),
  asyncHandler(placeOrder)
);

router.post(
  '/orders/:id/payment/verify',
  ...customerOnly,
  validateParams(idParamSchema),
  validateRequest(verifyPaymentSchema),
  asyncHandler(verifyPayment)
);

router.patch(
  '/orders/:id/status',
  ...managerOrAdmin,
  validateParams(idParamSchema),
  validateRequest(updateStatusSchema),
  asyncHandler(updateOrderStatus)
);

// Scoped retrieval (all roles - internal ownership filters applied in service layer)
router.get(
  '/orders',
  authenticate,
  asyncHandler(getOrders)
);

router.get(
  '/orders/:id',
  authenticate,
  validateParams(idParamSchema),
  asyncHandler(getOrderById)
);

export default router;
