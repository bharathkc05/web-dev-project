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
});

const authenticate = async (req, res, next) => {
  try {
    const token = extractBearerToken(req.headers.authorization);
    const decoded = jwt.verify(token, config.JWT_ACCESS_SECRET);

    const user = await User.findById(decoded.sub).select('_id email role isActive').lean();
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

export default authenticate;
export { authenticate };
