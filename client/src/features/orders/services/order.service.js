import { api } from '../../../utils/api';

export const orderService = {
  getOrders: async (filters = {}) => {
    const response = await api.get('/orders', { params: filters });
    return response.data.data;
  },
  
  getOrderById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data.data;
  },
  
  updateOrderStatus: async (id, status) => {
    const response = await api.patch(`/orders/${id}/status`, { status });
    return response.data.data;
  },
};
