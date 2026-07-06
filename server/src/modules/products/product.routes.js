// server/src/modules/products/product.routes.js
import { Router } from 'express';
import {
  getProducts,
  getProductById,
  getPopularProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  createOffer,
  submitReview,
  applyOffer,
} from './product.controller.js';
import {
  createProductSchema,
  updateProductSchema,
  offerSchema,
  reviewSchema,
  productFilterSchema,
  idParamSchema,
} from './product.schema.js';
import authenticate from '../../shared/middleware/authenticate.js';
import authorize from '../../shared/middleware/authorize.js';
import singleImageUpload from '../../shared/middleware/upload.js';
import { validateRequest, validateQuery, validateParams } from '../../shared/middleware/validate.js';
import asyncHandler from '../../shared/middleware/asyncHandler.js';
import { ROLES } from '../../shared/constants/roles.js';

const router = Router();

const managerOrAdmin = [authenticate, authorize(ROLES.OUTLET_MANAGER, ROLES.ADMIN)];
const customerOnly = [authenticate, authorize(ROLES.CUSTOMER)];

// Public routes
router.get('/', validateQuery(productFilterSchema), asyncHandler(getProducts));
router.get('/popular', asyncHandler(getPopularProducts));
router.get('/:id', validateParams(idParamSchema), asyncHandler(getProductById));

// Protected routes - Product CRUD
router.post(
  '/',
  ...managerOrAdmin,
  singleImageUpload,
  validateRequest(createProductSchema),
  asyncHandler(createProduct)
);

router.put(
  '/:id',
  ...managerOrAdmin,
  singleImageUpload,
  validateParams(idParamSchema),
  validateRequest(updateProductSchema),
  asyncHandler(updateProduct)
);

router.delete(
  '/:id',
  ...managerOrAdmin,
  validateParams(idParamSchema),
  asyncHandler(deleteProduct)
);

// Protected routes - Reviews
router.post(
  '/:productId/reviews',
  ...customerOnly,
  validateRequest(reviewSchema),
  asyncHandler(submitReview)
);

// Protected routes - Offers
router.post(
  '/offers',
  ...managerOrAdmin,
  validateRequest(offerSchema),
  asyncHandler(createOffer)
);

router.post(
  '/offers/validate',
  authenticate,
  asyncHandler(applyOffer)
);

export default router;
