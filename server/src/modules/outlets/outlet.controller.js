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
    .select('_id name address storeTiming availableServices')
    .sort({ name: 1 })
    .lean();

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

    if (!lat || !lng) {
      return res.status(400).json(ApiResponse.error('Latitude (lat) and Longitude (lng) are required query parameters', 400));
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json(ApiResponse.error('Invalid coordinates format', 400));
    }

    const nearestOutlet = await Outlet.findOne({
      isActive: true,
      isApproved: true,
      deletedAt: null,
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude] // MongoDB expects [longitude, latitude]
          }
        }
      }
    })
    .select('_id name address storeTiming availableServices')
    .lean();

    if (!nearestOutlet) {
      return res.status(404).json(ApiResponse.error('No outlets found near your location', 404));
    }

    res.status(200).json(ApiResponse.ok(nearestOutlet, 'Nearest outlet found successfully'));
  } catch (error) {
    next(error);
  }
};
