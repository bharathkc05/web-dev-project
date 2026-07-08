import Outlet from '../../shared/models/outlet.model.js';
import { ApiResponse } from '../../shared/utils/ApiResponse.js';

/**
 * Get all active and approved outlets for public display
 * GET /api/outlets
 */
export const getActiveOutlets = async (req, res, next) => {
  try {
    const outlets = await Outlet.find({
      isActive: true,
      isApproved: true,
      deletedAt: null
    })
    .select('_id name')
    .sort({ name: 1 })
    .lean();

    res.status(200).json(ApiResponse.ok(outlets, 'Active outlets fetched successfully'));
  } catch (error) {
    next(error);
  }
};
