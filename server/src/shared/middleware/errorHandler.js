// server/src/shared/middleware/errorHandler.js
import { ApiError } from '../utils/ApiError.js';
import logger from '../utils/logger.js';
import config from '../../config/env.js';

const formatErrorResponse = (message, errors = []) => ({
  success: false,
  message,
  errors,
});

const logError = (err, req, statusCode) => {
  logger.error(err.message || 'Unhandled error', {
    statusCode,
    method: req.method,
    path: req.originalUrl || req.path,
    ip: req.ip,
    errors: err.errors || [],
    stack: config.NODE_ENV === 'production' ? undefined : err.stack,
  });
};

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = Array.isArray(err.errors) ? err.errors : [];

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
  }
  else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    errors = Object.values(err.errors).map((error) => ({
      field: error.path,
      message: error.message,
    }));
  }
  else if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `${field} already exists`;
    errors = [{ field, message }];
  }
  else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid resource ID';
    errors = [{ field: err.path, message: 'Invalid ID format' }];
  }
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
    errors = [];
  }
  else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
    errors = [];
  }
  else if (err.name === 'MulterError') {
    statusCode = 400;
    message = err.code === 'LIMIT_FILE_SIZE' ? 'File size must not exceed 5MB' : err.message;
    errors = [{
      field: 'image',
      message,
    }];
  }

  logError(err, req, statusCode);

  const safeMessage = statusCode >= 500 && config.NODE_ENV === 'production'
    ? 'Internal Server Error'
    : message;

  return res.status(statusCode).json(formatErrorResponse(safeMessage, errors));
};

export const notFoundHandler = (req, res) => {
  return res.status(404).json(formatErrorResponse(`Route ${req.method} ${req.path} not found`, []));
};
