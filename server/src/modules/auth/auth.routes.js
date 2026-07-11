// server/src/modules/auth/auth.routes.js
import { Router } from 'express';

import authenticate, { authenticateAllowExpired } from '../../shared/middleware/authenticate.js';
import asyncHandler from '../../shared/middleware/asyncHandler.js';
import { authLimiter } from '../../shared/middleware/rateLimiter.js';
import { validateRequest } from '../../shared/middleware/validate.js';
import {
  login,
  password,
  profile,
  editProfile,
  addSavedAddress,
  deleteSavedAddress,
  setDefaultSavedAddress,
  toggleFavourite,
  refresh,
  signup,
  signout,
} from './auth.controller.js';
import {
  signupSchema,
  loginSchema,
  updateProfileSchema,
} from './auth.schema.js';

const router = Router();

// Authentication endpoints
router.post('/signup', authLimiter, validateRequest(signupSchema), asyncHandler(signup));
router.post('/login', authLimiter, validateRequest(loginSchema), asyncHandler(login));
router.post('/refresh', authLimiter, authenticateAllowExpired, asyncHandler(refresh));
router.post('/logout', authenticate, asyncHandler(signout));

// Profile and details endpoints
router.get('/me', authenticate, asyncHandler(profile));
router.put('/profile', authenticate, validateRequest(updateProfileSchema), asyncHandler(editProfile));
router.put('/password', authenticate, asyncHandler(password));

// Saved Addresses endpoints
router.post('/profile/addresses', authenticate, asyncHandler(addSavedAddress));
router.delete('/profile/addresses/:addressId', authenticate, asyncHandler(deleteSavedAddress));
router.patch('/profile/addresses/:addressId/default', authenticate, asyncHandler(setDefaultSavedAddress));

// Favourites endpoints
router.post('/profile/favourites/toggle', authenticate, asyncHandler(toggleFavourite));

export default router;
