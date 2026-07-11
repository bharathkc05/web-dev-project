import Outlet from '../../shared/models/outlet.model.js';

export const createOutlet = async (outletData) => {
  return await Outlet.create({
    ...outletData,
    location: {
      type: 'Point',
      coordinates: [outletData.longitude, outletData.latitude]
    },
    isApproved: true,
    isActive: true
  });
};

export const getActiveOutlets = async () => {
  return await Outlet.find({
    isActive: true,
    isApproved: true,
    deletedAt: null
  })
  .select('_id name address storeTiming availableServices')
  .sort({ name: 1 })
  .lean();
};

export const getNearestOutlet = async (latitude, longitude) => {
  return await Outlet.findOne({
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
};
