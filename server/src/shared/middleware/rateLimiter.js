// server/src/shared/middleware/rateLimiter.js
import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';

import redisClient from '../utils/redis.js';

const createRetryAfterHandler = (message) => (req, res, next, options) => {
  const retryAfterSeconds = Math.max(1, Math.ceil(options.windowMs / 1000));
  res.set('Retry-After', String(retryAfterSeconds));
  res.status(options.statusCode).json({
    success: false,
    message,
    errors: [],
  });
};

let globalLimiterMiddleware;
export const globalLimiter = (req, res, next) => {
  if (!globalLimiterMiddleware) {
    const globalStore = new RedisStore({
      prefix: 'rate-limit:global:',
      sendCommand: (...args) => redisClient.sendCommand(args),
    });

    globalLimiterMiddleware = rateLimit({
      windowMs: 60 * 1000,
      max: 100,
      store: globalStore,
      standardHeaders: true,
      legacyHeaders: false,
      keyGenerator: (req) => req.ip,
      handler: createRetryAfterHandler('Too many requests, please try again later'),
      validate: { default: false },
    });
  }
  return globalLimiterMiddleware(req, res, next);
};

let authLimiterMiddleware;
export const authLimiter = (req, res, next) => {
  if (!authLimiterMiddleware) {
    const authStore = new RedisStore({
      prefix: 'rate-limit:auth:',
      sendCommand: (...args) => redisClient.sendCommand(args),
    });

    authLimiterMiddleware = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 5,
      store: authStore,
      standardHeaders: true,
      legacyHeaders: false,
      keyGenerator: (req) => req.ip,
      handler: createRetryAfterHandler('Too many login attempts, please try again later'),
      validate: { default: false },
    });
  }
  return authLimiterMiddleware(req, res, next);
};

export const apiLimiter = globalLimiter;

