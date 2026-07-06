import { Router } from 'express';

import asyncHandler from '../../shared/middleware/asyncHandler.js';
import authenticate from '../../shared/middleware/authenticate.js';
import authorize from '../../shared/middleware/authorize.js';
import { ROLES } from '../../shared/constants/roles.js';
import validateRequest from '../../shared/middleware/validateRequest.js';
import { validateParams, validateQuery } from '../../shared/middleware/validate.js';
import {
  approveOutlet,
  deleteUser,
  getAuditLogs,
  getOutlets,
  getPlatformAnalytics,
  getUsers,
  suspendOutlet,
  suspendUser,
} from './user.controller.js';
import {
  auditLogFilterSchema,
  idParamSchema,
  outletFilterSchema,
  suspendUserSchema,
  userFilterSchema,
} from './user.schema.js';

const router = Router();
const adminOnly = [authenticate, authorize(ROLES.ADMIN)];

router.get('/admin/users', ...adminOnly, validateQuery(userFilterSchema), asyncHandler(getUsers));
router.patch(
  '/admin/users/:id/suspend',
  ...adminOnly,
  validateParams(idParamSchema),
  validateRequest(suspendUserSchema),
  asyncHandler(suspendUser)
);
router.delete('/admin/users/:id', ...adminOnly, validateParams(idParamSchema), asyncHandler(deleteUser));

router.get('/admin/outlets', ...adminOnly, validateQuery(outletFilterSchema), asyncHandler(getOutlets));
router.patch('/admin/outlets/:id/approve', ...adminOnly, validateParams(idParamSchema), asyncHandler(approveOutlet));
router.patch('/admin/outlets/:id/suspend', ...adminOnly, validateParams(idParamSchema), asyncHandler(suspendOutlet));

router.get('/admin/analytics', ...adminOnly, asyncHandler(getPlatformAnalytics));
router.get('/admin/audit-logs', ...adminOnly, validateQuery(auditLogFilterSchema), asyncHandler(getAuditLogs));

export default router;
