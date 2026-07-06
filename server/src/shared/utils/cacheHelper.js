// server/src/shared/utils/cacheHelper.js
import { getRedisClient } from './redis.js';
import logger from './logger.js';

/**
 * Fetch and parse a JSON value from cache.
 */
export const getCache = async (key) => {
  try {
    const redis = await getRedisClient();
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    logger.error('Failed to get cache', { key, message: error.message });
    return null;
  }
};

/**
 * Stringify and set a JSON value in cache with optional TTL.
 */
export const setCache = async (key, data, ttlSeconds) => {
  try {
    const redis = await getRedisClient();
    const options = {};
    if (ttlSeconds) {
      options.EX = ttlSeconds;
    }
    await redis.set(key, JSON.stringify(data), options);
  } catch (error) {
    logger.error('Failed to set cache', { key, message: error.message });
  }
};

/**
 * Delete a cache key.
 */
export const deleteCache = async (key) => {
  try {
    const redis = await getRedisClient();
    await redis.del(key);
  } catch (error) {
    logger.error('Failed to delete cache', { key, message: error.message });
  }
};

/**
 * SCAN matching keys and delete them.
 */
export const deleteCachePattern = async (pattern) => {
  try {
    const redis = await getRedisClient();
    const keys = [];
    for await (const key of redis.scanIterator({ MATCH: pattern, COUNT: 100 })) {
      keys.push(key);
    }
    if (keys.length > 0) {
      await redis.del(keys);
      logger.info(`Invalidated cache pattern: ${pattern}, keysDeleted=${keys.length}`);
    }
  } catch (error) {
    logger.error('Failed to delete cache pattern', { pattern, message: error.message });
  }
};

export default {
  getCache,
  setCache,
  deleteCache,
  deleteCachePattern,
};
