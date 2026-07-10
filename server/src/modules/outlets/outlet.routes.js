import { Router } from 'express';
import asyncHandler from '../../shared/middleware/asyncHandler.js';
import { getActiveOutlets, getNearestOutlet } from './outlet.controller.js';

const router = Router();

// Public route to get active outlets
router.get('/', asyncHandler(getActiveOutlets));

// Public route to get nearest outlet by coordinates
router.get('/nearest', asyncHandler(getNearestOutlet));

export default router;
