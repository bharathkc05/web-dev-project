import jwt from 'jsonwebtoken';

import config from '../../config/env.js';
import User from '../../modules/auth/auth.model.js';
import { ApiError } from '../utils/ApiError.js';

const extractBearerToken = (authorizationHeader) => {
  if (!authorizationHeader?.startsWith('Bearer ')) {
    throw ApiError.unauthorized('Unauthorized');
  }

  const token = authorizationHeader.slice(7).trim();

  if (!token) {
    throw ApiError.unauthorized('Unauthorized');
  }

  return token;
};

const buildRequestUser = (user) => ({
  userId: String(user._id),
  email: user.email,
  role: user.role,
  outletId: user.outletId ? String(user.outletId) : null,
});

/**
 * Standard authenticate middleware — rejects expired tokens.
 * Used by all protected routes except /auth/refresh.
 */
const authenticate = async (req, res, next) => {
  try {
    const token = extractBearerToken(req.headers.authorization);
    const decoded = jwt.verify(token, config.JWT_ACCESS_SECRET);

    const user = await User.findById(decoded.sub).select('_id email role isActive outletId').lean();
    if (!user || !user.isActive) {
      throw ApiError.unauthorized('Unauthorized');
    }

    req.user = buildRequestUser(user);
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
      return next(ApiError.unauthorized('Unauthorized'));
    }

    return next(error);
  }
};

/**
 * Lenient authenticate middleware — also accepts expired tokens.
 * Used ONLY by POST /auth/refresh so we can extract the userId from
 * an expired access token to match against the stored refresh token.
 */
export const authenticateAllowExpired = async (req, res, next) => {
  try {
    const token = extractBearerToken(req.headers.authorization);

    // Use ignoreExpiration so we can still read the payload from an expired token
    const decoded = jwt.verify(token, config.JWT_ACCESS_SECRET, { ignoreExpiration: true });

    // Still reject structurally invalid tokens
    if (!decoded?.sub) {
      throw ApiError.unauthorized('Unauthorized');
    }

    const user = await User.findById(decoded.sub).select('_id email role isActive outletId').lean();
    if (!user || !user.isActive) {
      throw ApiError.unauthorized('Unauthorized');
    }

    req.user = buildRequestUser(user);
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(ApiError.unauthorized('Unauthorized'));
    }
    return next(error);
  }
};

export const optionalAuthenticate = async (req, res, next) => {
  try {
    if (req.headers.authorization?.startsWith('Bearer ')) {
      const token = extractBearerToken(req.headers.authorization);
      const decoded = jwt.verify(token, config.JWT_ACCESS_SECRET);
      const user = await User.findById(decoded.sub).select('_id email role isActive outletId').lean();
      if (user && user.isActive) {
        req.user = buildRequestUser(user);
      }
    }
  } catch (error) {
    // Ignore errors for optional auth
  }
  next();
};

export default authenticate;
export { authenticate };
