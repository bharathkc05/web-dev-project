import { api } from '../utils/api';

export const outletService = {
  getActiveOutlets: async () => {
    const response = await api.get('/outlets');
    return response.data;
  },
  getNearestOutlet: async (lat, lng) => {
    const response = await api.get(`/outlets/nearest?lat=${lat}&lng=${lng}`);
    return response.data;
  },
};
