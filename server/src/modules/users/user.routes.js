import { Router } from 'express';

import asyncHandler from '../../shared/middleware/asyncHandler.js';
import authenticate from '../../shared/middleware/authenticate.js';
import authorize from '../../shared/middleware/authorize.js';
import { ROLES } from '../../shared/constants/roles.js';
import validateRequest from '../../shared/middleware/validateRequest.js';
import { validateParams, validateQuery } from '../../shared/middleware/validate.js';
import {
  deleteUser,
  getAuditLogs,
  getPlatformAnalytics,
  getUsers,
  suspendUser,
  unsuspendUser,
  assignManager,
} from './user.controller.js';

import {
  auditLogFilterSchema,
  idParamSchema,
  suspendUserSchema,
  userFilterSchema,
  assignManagerSchema,
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
router.patch(
  '/admin/users/:id/unsuspend',
  ...adminOnly,
  validateParams(idParamSchema),
  asyncHandler(unsuspendUser)
);
router.patch(
  '/admin/users/:id/assign-manager',
  ...adminOnly,
  validateParams(idParamSchema),
  validateRequest(assignManagerSchema),
  asyncHandler(assignManager)
);
router.delete('/admin/users/:id', ...adminOnly, validateParams(idParamSchema), asyncHandler(deleteUser));


router.get('/admin/analytics', ...adminOnly, asyncHandler(getPlatformAnalytics));
router.get('/admin/audit-logs', ...adminOnly, validateQuery(auditLogFilterSchema), asyncHandler(getAuditLogs));

export default router;
