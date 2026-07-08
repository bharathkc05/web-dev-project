import { Router } from 'express';
import asyncHandler from '../../shared/middleware/asyncHandler.js';
import { getActiveOutlets } from './outlet.controller.js';

const router = Router();

// Public route to get active outlets
router.get('/', asyncHandler(getActiveOutlets));

export default router;
