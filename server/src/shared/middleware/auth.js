// server/src/shared/middleware/auth.js
import jwt from 'jsonwebtoken';
import User from '../../modules/auth/auth.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ROLES } from '../constants/roles.js';
import config from '../../config/env.js';

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new ApiError(401, 'Access token required');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.JWT_SECRET);

    const user = await User.findById(decoded.sub).select('+refreshTokenHash');
    if (!user || !user.isActive) {
      throw new ApiError(401, 'User not found or inactive');
    }

    req.user = user;
    req.tokenPayload = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new ApiError(401, 'Access token expired'));
    }
    if (err.name === 'JsonWebTokenError') {
      return next(new ApiError(401, 'Invalid access token'));
    }
    next(err);
  }
};

const authorize = (...allowedRoles) => (req, res, next) => {
  if (!req.user) return next(new ApiError(401, 'Not authenticated'));
  if (!allowedRoles.includes(req.user.role)) {
    return next(new ApiError(403, 'Insufficient permissions'));
  }
  next();
};

const authorizeOutlet = (req, res, next) => {
  if (!req.user) return next(new ApiError(401, 'Not authenticated'));
  if (req.user.role === ROLES.OUTLET_MANAGER && !req.user.outletId) {
    return next(new ApiError(403, 'Outlet not assigned'));
  }
  next();
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, config.JWT_SECRET);
      const user = await User.findById(decoded.sub);
      if (user?.isActive) {
        req.user = user;
        req.tokenPayload = decoded;
      }
    }
    next();
  } catch {
    next();
  }
};

export { authenticate, authorize, authorizeOutlet, optionalAuth };