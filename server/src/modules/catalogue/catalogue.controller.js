import * as catalogueService from './catalogue.service.js';

export const getCategories = async (req, res) => {
  const result = await catalogueService.getCategories(req.query);
  res.status(200).json({ success: true, data: result });
};

export const createCategory = async (req, res) => {
  const result = await catalogueService.createCategory(req.body, req.user.userId);
  res.status(201).json({ success: true, data: result });
};

export const updateCategory = async (req, res) => {
  const result = await catalogueService.updateCategory(req.params.id, req.body);
  res.status(200).json({ success: true, data: result });
};

export const deleteCategory = async (req, res) => {
  await catalogueService.deleteCategory(req.params.id);
  res.status(200).json({ success: true, data: null });
};

export const getQuickTabs = async (req, res) => {
  const result = await catalogueService.getQuickTabs(req.query);
  res.status(200).json({ success: true, data: result });
};

export const createQuickTab = async (req, res) => {
  const result = await catalogueService.createQuickTab(req.body, req.user.userId);
  res.status(201).json({ success: true, data: result });
};

export const updateQuickTab = async (req, res) => {
  const result = await catalogueService.updateQuickTab(req.params.id, req.body);
  res.status(200).json({ success: true, data: result });
};

export const deleteQuickTab = async (req, res) => {
  await catalogueService.deleteQuickTab(req.params.id);
  res.status(200).json({ success: true, data: null });
};

export const getBanners = async (req, res) => {
  const result = await catalogueService.getBanners(req.query);
  res.status(200).json({ success: true, data: result });
};

export const createBanner = async (req, res) => {
  const result = await catalogueService.createBanner(req.body, req.user.userId);
  res.status(201).json({ success: true, data: result });
};

export const updateBanner = async (req, res) => {
  const result = await catalogueService.updateBanner(req.params.id, req.body);
  res.status(200).json({ success: true, data: result });
};

export const deleteBanner = async (req, res) => {
  await catalogueService.deleteBanner(req.params.id);
  res.status(200).json({ success: true, data: null });
};
