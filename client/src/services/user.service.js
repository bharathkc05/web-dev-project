import { api } from '../utils/api';

export const userService = {
  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response.data.data;
  },
  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile', profileData);
    return response.data.data;
  },
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
  }
};
