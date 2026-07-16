import { ApiResponse } from '../../shared/utils/ApiResponse.js';
import * as outletService from './outlet.service.js';

/**
 * Get all active and approved outlets for public display
 * GET /api/outlets
 */
export const getActiveOutlets = async (req, res, next) => {
  try {
    const outlets = await outletService.getActiveOutlets();

    res.status(200).json(ApiResponse.ok(outlets, 'Active outlets fetched successfully'));
  } catch (error) {
    next(error);
  }
};

/**
 * Get the nearest active and approved outlet based on coordinates
 * GET /api/outlets/nearest?lat=12.9716&lng=77.5946
 */
export const getNearestOutlet = async (req, res, next) => {
  try {
    const { lat, lng } = req.query;

    const nearestOutlet = await outletService.getNearestOutlet(parseFloat(lat), parseFloat(lng));

    if (!nearestOutlet) {
      return res.status(404).json(ApiResponse.error('No outlets found near your location', 404));
    }

    res.status(200).json(ApiResponse.ok(nearestOutlet, 'Nearest outlet found successfully'));
  } catch (error) {
    next(error);
  }
};

export const createOutlet = async (req, res, next) => {
  try {
    const newOutlet = await outletService.createOutlet(req.body);
    res.status(201).json(ApiResponse.created(newOutlet, 'Outlet created successfully'));
  } catch (error) {
    next(error);
  }
};

export const getOutlets = async (req, res) => {
  const result = await outletService.getOutlets(req.query);
  res.status(200).json({ success: true, data: result });
};

export const approveOutlet = async (req, res) => {
  const result = await outletService.approveOutlet(req.params.id, req.user.userId);
  res.status(200).json({ success: true, data: result });
};

export const suspendOutlet = async (req, res) => {
  const result = await outletService.suspendOutlet(req.params.id, req.user.userId);
  res.status(200).json({ success: true, data: result });
};
