import { Category } from './category.model.js';
import { QuickTab } from './quickTab.model.js';
import { Banner } from './banner.model.js';
import { ApiError } from '../../shared/utils/ApiError.js';

// --- Categories ---
export const getCategories = async (filters = {}) => {
  const query = {};
  if (filters.isActive !== undefined) {
    query.isActive = filters.isActive === 'true';
  }
  return Category.find(query).sort({ order: 1, name: 1 }).populate('createdBy', 'name email');
};

export const createCategory = async (data, userId) => {
  const category = new Category({ ...data, createdBy: userId });
  await category.save();
  return category;
};

export const updateCategory = async (id, data) => {
  const category = await Category.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!category) throw ApiError.notFound('Category not found');
  return category;
};

export const deleteCategory = async (id) => {
  const category = await Category.findByIdAndDelete(id);
  if (!category) throw ApiError.notFound('Category not found');
  return category;
};

// --- QuickTabs ---
export const getQuickTabs = async (filters = {}) => {
  const query = {};
  if (filters.isActive !== undefined) {
    query.isActive = filters.isActive === 'true';
  }
  return QuickTab.find(query).sort({ order: 1, name: 1 }).populate('createdBy', 'name email');
};

export const createQuickTab = async (data, userId) => {
  const tab = new QuickTab({ ...data, createdBy: userId });
  await tab.save();
  return tab;
};

export const updateQuickTab = async (id, data) => {
  const tab = await QuickTab.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!tab) throw ApiError.notFound('QuickTab not found');
  return tab;
};

export const deleteQuickTab = async (id) => {
  const tab = await QuickTab.findByIdAndDelete(id);
  if (!tab) throw ApiError.notFound('QuickTab not found');
  return tab;
};

// --- Banners ---
export const getBanners = async (filters = {}) => {
  const query = {};
  if (filters.isActive !== undefined) {
    query.isActive = filters.isActive === 'true';
  }
  return Banner.find(query).sort({ order: 1, title: 1 }).populate('createdBy', 'name email');
};

export const createBanner = async (data, userId) => {
  const banner = new Banner({ ...data, createdBy: userId });
  await banner.save();
  return banner;
};

export const updateBanner = async (id, data) => {
  const banner = await Banner.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!banner) throw ApiError.notFound('Banner not found');
  return banner;
};

export const deleteBanner = async (id) => {
  const banner = await Banner.findByIdAndDelete(id);
  if (!banner) throw ApiError.notFound('Banner not found');
  return banner;
};
