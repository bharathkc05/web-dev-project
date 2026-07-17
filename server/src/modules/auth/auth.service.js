// server/src/modules/auth/auth.service.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

import config from '../../config/env.js';
import { sendEmail } from '../../shared/utils/email.js';
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
    phone: obj.phone,
    dateOfBirth: obj.dateOfBirth || null,
    gender: obj.gender || null,
    notificationSettings: obj.notificationSettings || {
      importantMessageAlerts: true,
      orderTracking: true,
      pushNotifications: true,
      exclusiveOffers: true,
    },
    savedAddresses: obj.savedAddresses || [],
  };
};

export const createUser = async (data) => {
  const email = normalizeEmail(data.email);
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    if (!existingUser.isDeleted) {
      throw ApiError.conflict('Email is already registered');
    }
    
    // Approach B: Reactivate the soft-deleted account
    const passwordHash = await bcrypt.hash(data.password, 10);
    existingUser.name = data.name;
    existingUser.passwordHash = passwordHash;
    existingUser.phone = data.phone || existingUser.phone;
    
    // Reset deletion flags
    existingUser.isDeleted = false;
    existingUser.deletedAt = null;
    existingUser.deletedBy = null;
    existingUser.isActive = true;
    
    await existingUser.save();
    
    const { accessToken, refreshToken } = createTokenPair(existingUser);
    await storeRefreshToken(existingUser._id, refreshToken);

    return {
      user: slimSerializeUser(existingUser),
      accessToken,
      refreshToken,
    };
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

export const forgotPassword = async (emailInput) => {
  const email = normalizeEmail(emailInput);
  const user = await User.findOne({ email });

  if (!user) {
    // Return true even if user doesn't exist to prevent email enumeration attacks
    return true;
  }
  
  if (!user.isActive && !user.isDeleted) {
    throw ApiError.badRequest('Your account is currently suspended. Please contact support.');
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${config.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

  const message = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); border: 1px solid #f0f0f0;">
      <div style="background-color: #703b29; padding: 40px 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase;">Velvet Bytes</h1>
      </div>
      <div style="padding: 40px 30px; background-color: #ffffff;">
        <h2 style="color: #333333; font-size: 22px; font-weight: 700; margin-top: 0; margin-bottom: 20px;">Password Reset Request</h2>
        <p style="color: #555555; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          Hi there,<br><br>
          We received a request to reset the password for your Velvet Bytes account. If you made this request, please click the button below to set a new password:
        </p>
        <div style="text-align: center; margin: 35px 0;">
          <a href="${resetUrl}" style="display: inline-block; padding: 14px 32px; background-color: #703b29; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase;">Reset Password</a>
        </div>
        <p style="color: #777777; font-size: 14px; line-height: 1.5; margin-bottom: 0;">
          <em>This link will expire in 10 minutes.</em><br>
          If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
        </p>
      </div>
      <div style="background-color: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #eeeeee;">
        <p style="color: #999999; font-size: 12px; margin: 0;">&copy; ${new Date().getFullYear()} Velvet Bytes. All rights reserved.</p>
      </div>
    </div>
  `;

  try {
    await sendEmail({
      to: user.email,
      subject: 'Velvet Bytes - Password Reset',
      html: message,
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    throw ApiError.internal('There was an error sending the email. Try again later!');
  }

  return true;
};

export const resetPassword = async (token, newPassword) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw ApiError.badRequest('Token is invalid or has expired');
  }

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  // Reactivate the account if it was soft-deleted
  if (user.isDeleted) {
    user.isDeleted = false;
    user.deletedAt = null;
    user.deletedBy = null;
    user.isActive = true;
  }

  await user.save();

  // Clear existing refresh token to force re-login everywhere (optional but good security)
  const redis = await getRedisClient();
  await redis.del(refreshTokenKey(user._id));

  return true;
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
  const { name, phone, dateOfBirth, gender, notificationSettings, email } = data;
  
  const updateFields = {};
  if (name !== undefined) updateFields.name = name;
  if (phone !== undefined) updateFields.phone = phone;
  if (dateOfBirth !== undefined) updateFields.dateOfBirth = dateOfBirth;
  if (gender !== undefined) updateFields.gender = gender;
  if (notificationSettings !== undefined) updateFields.notificationSettings = notificationSettings;

  if (email) {
    const normalizedEmail = email.trim().toLowerCase();
    const existingEmail = await User.findOne({ email: normalizedEmail, _id: { $ne: userId } });
    if (existingEmail) {
      throw ApiError.conflict('Email is already in use by another account');
    }
    updateFields.email = normalizedEmail;
  }

  const user = await User.findOneAndUpdate(
    { _id: userId, isActive: true },
    { $set: updateFields },
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
