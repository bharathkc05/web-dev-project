// server/src/modules/auth/auth.controller.js
import {
  createUser,
  getProfile,
  loginUser,
  logout,
  refreshTokens,
  updateProfile,
  addAddress,
  removeAddress,
  setDefaultAddress,
  toggleFavouriteProduct,
} from './auth.service.js';

export const signup = async (req, res, next) => {
  try {
    const result = await createUser(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await loginUser(email, password, req.ip);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const { userId, refreshToken } = req.body;
    const result = await refreshTokens(userId, refreshToken);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const signout = async (req, res, next) => {
  try {
    await logout(req.body.userId);
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

export const profile = async (req, res, next) => {
  try {
    const result = await getProfile(req.user.userId);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const editProfile = async (req, res, next) => {
  try {
    const result = await updateProfile(req.user.userId, req.body);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const addSavedAddress = async (req, res, next) => {
  try {
    const result = await addAddress(req.user.userId, req.body);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const deleteSavedAddress = async (req, res, next) => {
  try {
    const result = await removeAddress(req.user.userId, req.params.addressId);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const setDefaultSavedAddress = async (req, res, next) => {
  try {
    const result = await setDefaultAddress(req.user.userId, req.params.addressId);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const toggleFavourite = async (req, res, next) => {
  try {
    const result = await toggleFavouriteProduct(req.user.userId, req.body.productId);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const password = async (req, res, next) => {
  try {
    res.status(501).json({ success: false, message: 'Password update not implemented yet' });
  } catch (error) {
    next(error);
  }
};
