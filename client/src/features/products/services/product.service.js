import { api } from '../../../utils/api';

export const productService = {
  getProducts: async (filters = {}) => {
    const response = await api.get('/products', { params: filters });
    return response.data;
  },
  // --- Master Product (Admin) Methods ---
  getAllMasterProducts: async () => {
    const response = await api.get('/admin/master-products');
    return response.data;
  },

  createMasterProduct: async (formData) => {
    const response = await api.post('/admin/master-products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  updateMasterProduct: async (id, formData) => {
    const response = await api.put(`/admin/master-products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deleteMasterProduct: async (id) => {
    const response = await api.delete(`/admin/master-products/${id}`);
    return response.data;
  },

  toggleMasterProductStatus: async (id) => {
    const response = await api.patch(`/admin/master-products/${id}/status`);
    return response.data;
  },

  // --- Outlet Product Methods ---
  getAvailableMasterProducts: async () => {
    const response = await api.get('/products/available');
    return response.data;
  },

  activateProduct: async (data) => {
    const response = await api.post('/products/activate', data);
    return response.data;
  },
  
  activateAllProducts: async () => {
    const response = await api.post('/products/activate-all');
    return response.data;
  },
  
  updateOutletProduct: async (id, data) => {
    const response = await api.put(`/products/${id}`, data);
    return response.data;
  },
  
  deleteProduct: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },
  
  getOffers: async () => {
    const response = await api.get('/products/offers');
    return response.data;
  },
  
  getActiveOffers: async (outletId) => {
    const response = await api.get(`/products/outlets/${outletId}/offers/active`);
    return response.data;
  },
  
  createOffer: async (data) => {
    const response = await api.post('/products/offers', data);
    return response.data;
  },
  
  updateOffer: async (id, data) => {
    const response = await api.put(`/products/offers/${id}`, data);
    return response.data;
  },

  deleteOffer: async (id) => {
    const response = await api.delete(`/products/offers/${id}`);
    return response.data;
  },
  
  validateOffer: async (data) => {
    const response = await api.post('/products/offers/validate', data);
    return response.data;
  }
};
