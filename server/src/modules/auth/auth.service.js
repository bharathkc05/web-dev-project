// server/src/modules/auth/auth.service.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import config from '../../config/env.js';
import { CACHE_TTL } from '../../shared/constants/cacheTTL.js';
import { USER_ERRORS } from '../../shared/constants/errorMessages.js';
import { ApiError } from '../../shared/utils/ApiError.js';
import User from './auth.model.js';
import { getRedisClient } from '../../shared/utils/redis.js';
import { getCache, setCache } from '../../shared/utils/cacheHelper.js';

const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_ATTEMPT_WINDOW_SECONDS = 15 * 60;

const loginFailKey = (ip, email) => `login_fail:${ip}:${email}`;
const refreshTokenKey = (userId) => `refresh:${userId}`;
const profileCacheKey = (userId) => `user_profile:${userId}`;

const normalizeEmail = (email) => email.trim().toLowerCase();

const parseDurationToSeconds = (duration) => {
  const match = /^([0-9]+)([mhd])$/.exec(duration);
  if (!match) {
    throw new ApiError(500, `Invalid duration format: ${duration}`);
  }

  const amount = Number(match[1]);
  const unit = match[2];
  const multipliers = { m: 60, h: 60 * 60, d: 24 * 60 * 60 };
  return amount * multipliers[unit];
};

const createTokenPair = (user) => {
  const subject = String(user._id);
  const payload = { sub: subject, role: user.role };

  return {
    accessToken: jwt.sign(payload, config.JWT_ACCESS_SECRET, { expiresIn: config.JWT_EXPIRES_IN }),
    refreshToken: jwt.sign(payload, config.REFRESH_SECRET, { expiresIn: config.REFRESH_EXPIRES_IN }),
  };
};

const storeRefreshToken = async (userId, refreshToken) => {
  const redis = await getRedisClient();
  await redis.set(refreshTokenKey(userId), refreshToken, {
    EX: parseDurationToSeconds(config.REFRESH_EXPIRES_IN),
  });
};

const cacheProfile = async (userId, profile) => {
  await setCache(profileCacheKey(userId), profile, CACHE_TTL.USER_PROFILE);
};

const clearLoginFailures = async (redis, email, ip) => {
  await redis.del(loginFailKey(ip, email));
};

const recordLoginFailure = async (redis, email, ip) => {
  const key = loginFailKey(ip, email);
  const attempts = await redis.incr(key);
  if (attempts === 1) {
    await redis.expire(key, LOGIN_ATTEMPT_WINDOW_SECONDS);
  }
  return attempts;
};

const serializeUser = (user) => {
  if (typeof user?.toJSON === 'function') {
    return user.toJSON();
  }

  return JSON.parse(JSON.stringify(user));
};

/**
 * Returns a minimal user object for auth responses to avoid PII leakage.
 * Full profile data should only come from GET /auth/me.
 */
const slimSerializeUser = (user) => {
  const obj = typeof user?.toJSON === 'function' ? user.toJSON() : user;
  return {
    _id: obj._id,
    id: obj._id,
    name: obj.name,
    email: obj.email,
    role: obj.role,
    outletId: obj.outletId || null,
  };
};

export const createUser = async (data) => {
  const email = normalizeEmail(data.email);
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw ApiError.conflict('Email is already registered');
  }

  const passwordHash = await bcrypt.hash(data.password, 10);
  const user = await User.create({ ...data, email, passwordHash });
  const { accessToken, refreshToken } = createTokenPair(user);

  await storeRefreshToken(user._id, refreshToken);

  return {
    user: slimSerializeUser(user),
    accessToken,
    refreshToken,
  };
};

export const loginUser = async (emailInput, password, ip = 'unknown') => {
  const email = normalizeEmail(emailInput);
  const redis = await getRedisClient();

  // Check brute-force attempts BEFORE querying the database
  const failKey = loginFailKey(ip, email);
  const currentAttempts = await redis.get(failKey);
  if (currentAttempts && Number(currentAttempts) >= MAX_LOGIN_ATTEMPTS) {
    throw ApiError.tooManyRequests('Too many failed login attempts. Please try again later.');
  }

  const user = await User.findOne({ email }).select('+passwordHash');
  const isValidPassword = user ? await bcrypt.compare(password, user.passwordHash) : false;

  if (!user || !isValidPassword) {
    // Record the failed attempt
    await recordLoginFailure(redis, email, ip);
    throw ApiError.unauthorized(USER_ERRORS.INVALID_CREDENTIALS);
  }

  if (!user.isActive) {
    throw ApiError.unauthorized(USER_ERRORS.ACCOUNT_SUSPENDED);
  }

  // Successful login — clear failure counter
  await clearLoginFailures(redis, email, ip);

  const { accessToken, refreshToken } = createTokenPair(user);
  await storeRefreshToken(user._id, refreshToken);

  return {
    user: slimSerializeUser(user),
    accessToken,
    refreshToken,
  };
};

export const refreshTokens = async (userId, oldRefreshToken) => {
  const redis = await getRedisClient();
  const key = refreshTokenKey(userId);
  const storedRefreshToken = await redis.get(key);

  if (!storedRefreshToken || storedRefreshToken !== oldRefreshToken) {
    throw ApiError.unauthorized('Invalid refresh token');
  }

  let decoded;
  try {
    decoded = jwt.verify(oldRefreshToken, config.REFRESH_SECRET);
  } catch (error) {
    throw ApiError.unauthorized(error.name === 'TokenExpiredError' ? 'Refresh token expired' : 'Invalid refresh token');
  }

  if (String(decoded.sub) !== String(userId)) {
    throw ApiError.unauthorized('Refresh token does not match user');
  }

  const user = await User.findById(userId);
  if (!user || !user.isActive) {
    throw ApiError.unauthorized('User not found or inactive');
  }

  await redis.del(key);

  const tokens = createTokenPair(user);
  await storeRefreshToken(user._id, tokens.refreshToken);

  return tokens;
};

export const logout = async (userId) => {
  const redis = await getRedisClient();
  await redis.del(refreshTokenKey(userId));
};

export const getProfile = async (userId) => {
  const cachedProfile = await getCache(profileCacheKey(userId));

  if (cachedProfile) {
    return cachedProfile;
  }

  const user = await User.findById(userId);
  if (!user || !user.isActive) {
    throw ApiError.notFound(USER_ERRORS.NOT_FOUND);
  }

  const profile = serializeUser(user);
  await cacheProfile(userId, profile);

  return profile;
};

export const updateProfile = async (userId, data) => {
  const { name, phone } = data;
  const user = await User.findOneAndUpdate(
    { _id: userId, isActive: true },
    { $set: { name, phone } },
    { new: true }
  );

  if (!user) {
    throw ApiError.notFound(USER_ERRORS.NOT_FOUND);
  }

  const profile = serializeUser(user);
  await cacheProfile(userId, profile);
  return profile;
};

export const addAddress = async (userId, addressData) => {
  const user = await User.findOne({ _id: userId, isActive: true });
  if (!user) {
    throw ApiError.notFound(USER_ERRORS.NOT_FOUND);
  }

  if (user.savedAddresses.length >= 2) {
    throw ApiError.badRequest('You can only have a maximum of 2 delivery addresses');
  }

  // If isDefault is true or this is the first address, unset isDefault on other addresses
  const shouldBeDefault = addressData.isDefault || user.savedAddresses.length === 0;

  if (shouldBeDefault) {
    user.savedAddresses.forEach((addr) => {
      addr.isDefault = false;
    });
  }

  user.savedAddresses.push({
    ...addressData,
    isDefault: shouldBeDefault,
  });

  await user.save();
  const profile = serializeUser(user);
  await cacheProfile(userId, profile);
  return user.savedAddresses;
};

export const removeAddress = async (userId, addressId) => {
  const user = await User.findOne({ _id: userId, isActive: true });
  if (!user) {
    throw ApiError.notFound(USER_ERRORS.NOT_FOUND);
  }

  const addressIndex = user.savedAddresses.findIndex(
    (addr) => String(addr._id) === String(addressId)
  );

  if (addressIndex === -1) {
    throw ApiError.notFound('Address not found');
  }

  const wasDefault = user.savedAddresses[addressIndex].isDefault;
  user.savedAddresses.splice(addressIndex, 1);

  // If we removed the default address and there are other addresses left, make the first one default
  if (wasDefault && user.savedAddresses.length > 0) {
    user.savedAddresses[0].isDefault = true;
  }

  await user.save();
  const profile = serializeUser(user);
  await cacheProfile(userId, profile);
  return user.savedAddresses;
};

export const setDefaultAddress = async (userId, addressId) => {
  const user = await User.findOne({ _id: userId, isActive: true });
  if (!user) {
    throw ApiError.notFound(USER_ERRORS.NOT_FOUND);
  }

  let addressFound = false;
  user.savedAddresses.forEach((addr) => {
    if (String(addr._id) === String(addressId)) {
      addr.isDefault = true;
      addressFound = true;
    } else {
      addr.isDefault = false;
    }
  });

  if (!addressFound) {
    throw ApiError.notFound('Address not found');
  }

  await user.save();
  const profile = serializeUser(user);
  await cacheProfile(userId, profile);
  return user.savedAddresses;
};

export const toggleFavouriteProduct = async (userId, productId) => {
  const user = await User.findOne({ _id: userId, isActive: true });
  if (!user) {
    throw ApiError.notFound(USER_ERRORS.NOT_FOUND);
  }

  const favIndex = user.favouriteProductIds.findIndex(
    (id) => String(id) === String(productId)
  );

  if (favIndex === -1) {
    user.favouriteProductIds.push(productId);
  } else {
    user.favouriteProductIds.splice(favIndex, 1);
  }

  await user.save();
  const profile = serializeUser(user);
  await cacheProfile(userId, profile);
  return user.favouriteProductIds;
};
