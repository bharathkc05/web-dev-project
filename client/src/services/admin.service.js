import { api } from '../utils/api';

export const adminService = {
  getOutlets: async (filters = {}) => {
    const response = await api.get('/admin/outlets', { params: filters });
    return response.data;
  },

  createOutlet: async (outletData) => {
    const response = await api.post('/admin/outlets', outletData);
    return response.data;
  },

  approveOutlet: async (id) => {
    const response = await api.patch(`/admin/outlets/${id}/approve`);
    return response.data;
  },

  suspendOutlet: async (id) => {
    const response = await api.patch(`/admin/outlets/${id}/suspend`);
    return response.data;
  },

  getUsers: async (filters = {}) => {
    const response = await api.get('/admin/users', { params: filters });
    return response.data;
  },

  suspendUser: async (id, reason) => {
    const response = await api.patch(`/admin/users/${id}/suspend`, { reason });
    return response.data;
  },

  unsuspendUser: async (id) => {
    const response = await api.patch(`/admin/users/${id}/unsuspend`);
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },

  assignManager: async (userId, outletId) => {
    const response = await api.patch(`/admin/users/${userId}/assign-manager`, { outletId });
    return response.data;
  },

  getPlatformAnalytics: async () => {
    const response = await api.get('/admin/analytics');
    return response.data;
  },

  // Categories
  getCategories: async () => {
    const response = await api.get('/admin/categories');
    return response.data;
  },
  createCategory: async (data) => {
    const response = await api.post('/admin/categories', data);
    return response.data;
  },
  updateCategory: async (id, data) => {
    const response = await api.put(`/admin/categories/${id}`, data);
    return response.data;
  },
  deleteCategory: async (id) => {
    const response = await api.delete(`/admin/categories/${id}`);
    return response.data;
  },

  // QuickTabs
  getQuickTabs: async () => {
    const response = await api.get('/admin/quicktabs');
    return response.data;
  },
  createQuickTab: async (data) => {
    const response = await api.post('/admin/quicktabs', data);
    return response.data;
  },
  updateQuickTab: async (id, data) => {
    const response = await api.put(`/admin/quicktabs/${id}`, data);
    return response.data;
  },
  deleteQuickTab: async (id) => {
    const response = await api.delete(`/admin/quicktabs/${id}`);
    return response.data;
  },

  // Banners
  getBanners: async () => {
    const response = await api.get('/admin/banners');
    return response.data;
  },
  createBanner: async (data) => {
    const response = await api.post('/admin/banners', data);
    return response.data;
  },
  updateBanner: async (id, data) => {
    const response = await api.put(`/admin/banners/${id}`, data);
    return response.data;
  },
  deleteBanner: async (id) => {
    const response = await api.delete(`/admin/banners/${id}`);
    return response.data;
  },

  getAuditLogs: async (filters = {}) => {
    const response = await api.get('/admin/audit-logs', { params: filters });
    return response.data;
  },
};
