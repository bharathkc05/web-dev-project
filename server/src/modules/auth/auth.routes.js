// server/src/modules/auth/auth.routes.js
import { Router } from 'express';

import authenticate from '../../shared/middleware/authenticate.js';
import { authLimiter } from '../../shared/middleware/rateLimiter.js';
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

const router = Router();

// Authentication endpoints
router.post('/signup', signup);
router.post('/login', authLimiter, login);
router.post('/refresh', refresh);
router.post('/logout', signout);

// Profile and details endpoints
router.get('/me', authenticate, profile);
router.put('/profile', authenticate, editProfile);
router.put('/password', authenticate, password);

// Saved Addresses endpoints
router.post('/profile/addresses', authenticate, addSavedAddress);
router.delete('/profile/addresses/:addressId', authenticate, deleteSavedAddress);
router.patch('/profile/addresses/:addressId/default', authenticate, setDefaultSavedAddress);

// Favourites endpoints
router.post('/profile/favourites/toggle', authenticate, toggleFavourite);

export default router;
