import { ApiError } from '../utils/ApiError.js';

const authorize = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return next(ApiError.unauthorized('Unauthorized'));
  }

  if (!allowedRoles.includes(req.user.role)) {
    return next(ApiError.forbidden('Forbidden'));
  }

  return next();
};

export default authorize;
export { authorize };
