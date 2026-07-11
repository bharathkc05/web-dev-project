import { Router } from 'express';
import asyncHandler from '../../shared/middleware/asyncHandler.js';
import { getActiveOutlets, getNearestOutlet } from './outlet.controller.js';
import { validateQuery } from '../../shared/middleware/validate.js';
import { getNearestOutletSchema } from './outlet.schema.js';

const router = Router();

// Public route to get active outlets
router.get('/', asyncHandler(getActiveOutlets));

// Public route to get nearest outlet by coordinates
router.get('/nearest', validateQuery(getNearestOutletSchema), asyncHandler(getNearestOutlet));

export default router;
