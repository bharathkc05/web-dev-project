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
  forgotPassword as forgotPasswordService,
  resetPassword as resetPasswordService,
} from './auth.service.js';

export const forgotPassword = async (req, res) => {
  await forgotPasswordService(req.body.email);
  // Always return the same success message to prevent user enumeration
  res.status(200).json({ success: true, message: 'If an account exists, a password reset link has been sent to the email.' });
};

export const resetPassword = async (req, res) => {
  await resetPasswordService(req.params.token, req.body.password);
  res.status(200).json({ success: true, message: 'Password has been reset successfully' });
};

export const signup = async (req, res) => {
  const result = await createUser(req.body);
  res.status(201).json({ success: true, data: result });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const result = await loginUser(email, password, req.ip);
  res.status(200).json({ success: true, data: result });
};

export const refresh = async (req, res) => {
  const { refreshToken } = req.body;
  // userId comes from the authenticated user, not from the body
  const result = await refreshTokens(req.user.userId, refreshToken);
  res.status(200).json({ success: true, data: result });
};

export const signout = async (req, res) => {
  // userId comes from the authenticated user, not from the body
  await logout(req.user.userId);
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

export const profile = async (req, res) => {
  const result = await getProfile(req.user.userId);
  res.status(200).json({ success: true, data: result });
};

export const editProfile = async (req, res) => {
  const result = await updateProfile(req.user.userId, req.body);
  res.status(200).json({ success: true, data: result });
};

export const addSavedAddress = async (req, res) => {
  const result = await addAddress(req.user.userId, req.body);
  res.status(200).json({ success: true, data: result });
};

export const deleteSavedAddress = async (req, res) => {
  const result = await removeAddress(req.user.userId, req.params.addressId);
  res.status(200).json({ success: true, data: result });
};

export const setDefaultSavedAddress = async (req, res) => {
  const result = await setDefaultAddress(req.user.userId, req.params.addressId);
  res.status(200).json({ success: true, data: result });
};

export const toggleFavourite = async (req, res) => {
  const result = await toggleFavouriteProduct(req.user.userId, req.body.productId);
  res.status(200).json({ success: true, data: result });
};

export const password = async (req, res) => {
  res.status(501).json({ success: false, message: 'Password update not implemented yet' });
};
