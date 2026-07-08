import * as masterProductService from './masterProduct.service.js';
import { ApiResponse } from '../../shared/utils/ApiResponse.js';

export const getAllMasterProducts = async (req, res, next) => {
  try {
    const products = await masterProductService.getAllMasterProducts();
    res.status(200).json(ApiResponse.ok(products, 'Master products fetched successfully'));
  } catch (error) {
    next(error);
  }
};

export const createMasterProduct = async (req, res, next) => {
  try {
    const product = await masterProductService.createMasterProduct(req.body, req.file, req.user.userId);
    res.status(201).json(ApiResponse.created(product, 'Master product created successfully'));
  } catch (error) {
    next(error);
  }
};

export const updateMasterProduct = async (req, res, next) => {
  try {
    const product = await masterProductService.updateMasterProduct(req.params.id, req.body, req.file);
    res.status(200).json(ApiResponse.ok(product, 'Master product updated successfully'));
  } catch (error) {
    next(error);
  }
};

export const deleteMasterProduct = async (req, res, next) => {
  try {
    await masterProductService.deleteMasterProduct(req.params.id);
    res.status(200).json(ApiResponse.ok(null, 'Master product deleted successfully'));
  } catch (error) {
    next(error);
  }
};
