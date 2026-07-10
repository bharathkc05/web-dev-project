import { Router } from 'express';
import asyncHandler from '../../shared/middleware/asyncHandler.js';
import authenticate from '../../shared/middleware/authenticate.js';
import authorize from '../../shared/middleware/authorize.js';
import { ROLES } from '../../shared/constants/roles.js';
import * as catalogueController from './catalogue.controller.js';

const router = Router();
const adminOnly = [authenticate, authorize(ROLES.ADMIN)];

// Public routes (for frontend consumption)
router.get('/categories', asyncHandler(catalogueController.getCategories));
router.get('/quicktabs', asyncHandler(catalogueController.getQuickTabs));
router.get('/banners', asyncHandler(catalogueController.getBanners));

// Admin CRUD routes
// Categories
router.get('/admin/categories', ...adminOnly, asyncHandler(catalogueController.getCategories));
router.post('/admin/categories', ...adminOnly, asyncHandler(catalogueController.createCategory));
router.put('/admin/categories/:id', ...adminOnly, asyncHandler(catalogueController.updateCategory));
router.delete('/admin/categories/:id', ...adminOnly, asyncHandler(catalogueController.deleteCategory));

// QuickTabs
router.get('/admin/quicktabs', ...adminOnly, asyncHandler(catalogueController.getQuickTabs));
router.post('/admin/quicktabs', ...adminOnly, asyncHandler(catalogueController.createQuickTab));
router.put('/admin/quicktabs/:id', ...adminOnly, asyncHandler(catalogueController.updateQuickTab));
router.delete('/admin/quicktabs/:id', ...adminOnly, asyncHandler(catalogueController.deleteQuickTab));

// Banners
router.get('/admin/banners', ...adminOnly, asyncHandler(catalogueController.getBanners));
router.post('/admin/banners', ...adminOnly, asyncHandler(catalogueController.createBanner));
router.put('/admin/banners/:id', ...adminOnly, asyncHandler(catalogueController.updateBanner));
router.delete('/admin/banners/:id', ...adminOnly, asyncHandler(catalogueController.deleteBanner));

export default router;
