// server/src/shared/utils/redis.js
import { createClient } from 'redis';

import config from '../../config/env.js';
import logger from './logger.js';

const redisClient = createClient({
  url: config.REDIS_URL,
});

let connectPromise;

redisClient.on('error', (error) => {
  logger.error('Redis client error', { message: error.message, stack: error.stack });
});

export const connectRedis = async () => {
  if (redisClient.isOpen) {
    return redisClient;
  }

  if (!connectPromise) {
    connectPromise = redisClient.connect().then(() => {
      logger.info('Redis connected');
      return redisClient;
    });
  }

  return connectPromise;
};

export const disconnectRedis = async () => {
  if (!redisClient.isOpen) {
    return;
  }

  await redisClient.quit();
  connectPromise = undefined;
};

export const getRedisClient = async () => {
  await connectRedis();
  return redisClient;
};

export default redisClient;