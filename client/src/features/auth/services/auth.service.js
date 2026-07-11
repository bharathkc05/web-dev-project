import { api } from '../../../utils/api';

export const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  signup: async (data) => {
    const response = await api.post('/auth/signup', data);
    return response.data;
  },

  refresh: async () => {
    const response = await api.post('/auth/refresh');
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data.data;
  },

  updateProfile: async (data) => {
    const response = await api.put('/auth/profile', data);
    return response.data.data;
  },

  changePassword: async (data) => {
    const response = await api.put('/auth/change-password', data);
    return response.data;
  },

  // Address management
  addAddress: async (addressData) => {
    const response = await api.post('/auth/profile/addresses', addressData);
    return response.data.data;
  },

  deleteAddress: async (addressId) => {
    const response = await api.delete(`/auth/profile/addresses/${addressId}`);
    return response.data.data;
  },

  setDefaultAddress: async (addressId) => {
    const response = await api.patch(`/auth/profile/addresses/${addressId}/default`);
    return response.data.data;
  },
};
