// server/src/modules/products/product.routes.js
import { Router } from 'express';
import {
  getProducts,
  getProductById,
  getPopularProducts,
  activateProduct,
  activateAllProducts,
  updateOutletProduct,
  deleteProduct,
  getOffers,
  createOffer,
  submitReview,
  applyOffer,
  getAvailableMasterProducts,
  getActiveOffers,
  updateOffer,
  deleteOffer,
  createCampaign,
} from './product.controller.js';
import {
  activateProductSchema,
  updateOutletProductSchema,
  offerSchema,
  reviewSchema,
  productFilterSchema,
  idParamSchema,
  personalizedCampaignSchema,
} from './product.schema.js';
import authenticate, { optionalAuthenticate } from '../../shared/middleware/authenticate.js';
import authorize from '../../shared/middleware/authorize.js';
import { validateRequest, validateQuery, validateParams } from '../../shared/middleware/validate.js';
import asyncHandler from '../../shared/middleware/asyncHandler.js';
import { ROLES } from '../../shared/constants/roles.js';

const router = Router();

const managerOrAdmin = [authenticate, authorize(ROLES.OUTLET_MANAGER, ROLES.ADMIN)];
const customerOnly = [authenticate, authorize(ROLES.CUSTOMER)];

// Public routes
router.get('/', validateQuery(productFilterSchema), asyncHandler(getProducts));
router.get('/popular', asyncHandler(getPopularProducts));
router.get('/outlets/:outletId/offers/active', optionalAuthenticate, asyncHandler(getActiveOffers));

// Protected routes - Outlet Product Activation and Management
router.get(
  '/available',
  ...managerOrAdmin,
  asyncHandler(getAvailableMasterProducts)
);

router.post(
  '/activate',
  ...managerOrAdmin,
  validateRequest(activateProductSchema),
  asyncHandler(activateProduct)
);

router.post(
  '/activate-all',
  ...managerOrAdmin,
  asyncHandler(activateAllProducts)
);

// Protected routes - Offers
router.get(
  '/offers',
  ...managerOrAdmin,
  asyncHandler(getOffers)
);

router.post(
  '/offers',
  ...managerOrAdmin,
  validateRequest(offerSchema),
  asyncHandler(createOffer)
);

router.put(
  '/offers/:id',
  ...managerOrAdmin,
  validateRequest(offerSchema),
  asyncHandler(updateOffer)
);

router.delete(
  '/offers/:id',
  ...managerOrAdmin,
  asyncHandler(deleteOffer)
);

router.post(
  '/campaigns',
  ...managerOrAdmin,
  validateRequest(personalizedCampaignSchema),
  asyncHandler(createCampaign)
);

router.post(
  '/offers/validate',
  authenticate,
  asyncHandler(applyOffer)
);

// Dynamic Parameter Routes (Must be at the bottom to avoid shadowing)
router.get('/:id', validateParams(idParamSchema), asyncHandler(getProductById));

router.put(
  '/:id',
  ...managerOrAdmin,
  validateParams(idParamSchema),
  validateRequest(updateOutletProductSchema),
  asyncHandler(updateOutletProduct)
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

export default router;
