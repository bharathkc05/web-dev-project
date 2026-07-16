import { Router } from 'express';
import asyncHandler from '../../shared/middleware/asyncHandler.js';
import authenticate from '../../shared/middleware/authenticate.js';
import authorize from '../../shared/middleware/authorize.js';
import { ROLES } from '../../shared/constants/roles.js';
import validateRequest from '../../shared/middleware/validateRequest.js';
import { validateQuery, validateParams } from '../../shared/middleware/validate.js';
import { 
  getActiveOutlets, 
  getNearestOutlet, 
  createOutlet, 
  getOutlets, 
  approveOutlet, 
  suspendOutlet 
} from './outlet.controller.js';
import { 
  getNearestOutletSchema,
  outletFilterSchema, 
  createOutletSchema, 
  idParamSchema 
} from './outlet.schema.js';

const router = Router();
const adminOnly = [authenticate, authorize(ROLES.ADMIN)];

// Public route to get active outlets
router.get('/outlets', asyncHandler(getActiveOutlets));

// Public route to get nearest outlet by coordinates
router.get('/outlets/nearest', validateQuery(getNearestOutletSchema), asyncHandler(getNearestOutlet));

// Admin routes for managing outlets
router.get('/admin/outlets', ...adminOnly, validateQuery(outletFilterSchema), asyncHandler(getOutlets));
router.post('/admin/outlets', ...adminOnly, validateRequest(createOutletSchema), asyncHandler(createOutlet));
router.patch('/admin/outlets/:id/approve', ...adminOnly, validateParams(idParamSchema), asyncHandler(approveOutlet));
router.patch('/admin/outlets/:id/suspend', ...adminOnly, validateParams(idParamSchema), asyncHandler(suspendOutlet));

export default router;
