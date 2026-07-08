// server/src/modules/products/product.controller.js
import * as productService from './product.service.js';
import { ApiResponse } from '../../shared/utils/ApiResponse.js';

export const getProducts = async (req, res, next) => {
  try {
    const { cursor, limit, ...filters } = req.query;
    const result = await productService.getAllProducts(filters, cursor, Number(limit || 20));
    res.status(200).json(ApiResponse.ok(result, 'Products fetched successfully'));
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const result = await productService.getProductById(req.params.id);
    res.status(200).json(ApiResponse.ok(result, 'Product details fetched successfully'));
  } catch (error) {
    next(error);
  }
};

export const getPopularProducts = async (req, res, next) => {
  try {
    const result = await productService.getPopularProducts();
    res.status(200).json(ApiResponse.ok(result, 'Popular products fetched successfully'));
  } catch (error) {
    next(error);
  }
};

export const activateProduct = async (req, res, next) => {
  try {
    const data = { ...req.body, outletId: req.user.outletId };
    const result = await productService.activateProduct(data);
    res.status(201).json(ApiResponse.created(result, 'Product activated successfully'));
  } catch (error) {
    next(error);
  }
};

export const getAvailableMasterProducts = async (req, res, next) => {
  try {
    const result = await productService.getAvailableMasterProducts(req.user.outletId);
    res.status(200).json(ApiResponse.ok(result, 'Available master products fetched successfully'));
  } catch (error) {
    next(error);
  }
};

export const updateOutletProduct = async (req, res, next) => {
  try {
    const result = await productService.updateOutletProduct(req.params.id, req.body, req.user);
    res.status(200).json(ApiResponse.ok(result, 'Outlet product updated successfully'));
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const result = await productService.softDeleteProduct(req.params.id, req.user);
    res.status(200).json(ApiResponse.ok(result, 'Product deleted successfully (soft delete)'));
  } catch (error) {
    next(error);
  }
};

export const createOffer = async (req, res, next) => {
  try {
    // Outlet Manager creates offer for their assigned outlet
    const outletId = req.user.outletId;
    const result = await productService.createOffer(outletId, req.body);
    res.status(201).json(ApiResponse.created(result, 'Offer created successfully'));
  } catch (error) {
    next(error);
  }
};

export const getOffers = async (req, res, next) => {
  try {
    const outletId = req.user.outletId;
    const result = await productService.getOffers(outletId);
    res.status(200).json(ApiResponse.ok(result, 'Offers fetched successfully'));
  } catch (error) {
    next(error);
  }
};

export const submitReview = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { orderId, rating, comment } = req.body;
    const result = await productService.submitReview(productId, req.user.userId, orderId, { rating, comment });
    res.status(201).json(ApiResponse.created(result, 'Review submitted successfully'));
  } catch (error) {
    next(error);
  }
};

export const applyOffer = async (req, res, next) => {
  try {
    const { code, outletId, subtotal } = req.body;
    const result = await productService.validateOffer(code, outletId, Number(subtotal));
    res.status(200).json(ApiResponse.ok(result, 'Offer is valid'));
  } catch (error) {
    next(error);
  }
};
