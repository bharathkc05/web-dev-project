import Outlet from './outlet.model.js';
import { MasterProduct } from '../products/masterProduct.model.js';
import { Product } from '../products/product.model.js';
import { ApiError } from '../../shared/utils/ApiError.js';
import AuditLog from '../../shared/models/auditLog.model.js';
import User from '../auth/auth.model.js';

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

const getActorRole = async (actorId) => {
  const actor = await User.findById(actorId).select('role').lean();
  if (!actor) {
    throw ApiError.notFound('Actor not found');
  }
  return actor.role;
};

const writeAuditLog = async ({ actorId, role, action, targetType, targetId, metadata = {} }) => {
  await AuditLog.create({
    actorId,
    role,
    action,
    targetType,
    targetId: targetId ? String(targetId) : null,
    metadata,
    createdAt: new Date(),
  });
};

export const getOutlets = async (filters = {}) => {
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const query = { deletedAt: null };

  if (typeof filters.isApproved === 'boolean') {
    query.isApproved = filters.isApproved;
  }

  if (typeof filters.isActive === 'boolean') {
    query.isActive = filters.isActive;
  }

  const [items, total, totalMasterProducts] = await Promise.all([
    Outlet.find(query)
      .sort({ createdAt: -1, _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Outlet.countDocuments(query),
    MasterProduct.countDocuments({ isActive: true }),
  ]);

  const outletIds = items.map(outlet => outlet._id);

  const productCounts = await Product.aggregate([
    { $match: { outletId: { $in: outletIds } } },
    {
      $group: {
        _id: '$outletId',
        totalActivatedCount: { $sum: 1 },
        activeProductsCount: { $sum: { $cond: ['$isAvailable', 1, 0] } },
      },
    },
  ]);

  const countsMap = productCounts.reduce((acc, curr) => {
    acc[curr._id.toString()] = curr;
    return acc;
  }, {});

  const enrichedItems = items.map(outlet => {
    const counts = countsMap[outlet._id.toString()] || { totalActivatedCount: 0, activeProductsCount: 0 };
    return {
      ...outlet,
      activeProductsCount: counts.activeProductsCount,
      totalActivatedCount: counts.totalActivatedCount,
      totalMasterProducts,
    };
  });

  return {
    items: enrichedItems,
    pageInfo: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

export const approveOutlet = async (outletId, actorId) => {
  const actorRole = await getActorRole(actorId);

  const outlet = await Outlet.findOneAndUpdate(
    { _id: outletId, deletedAt: null },
    {
      $set: {
        isApproved: true,
        isActive: true,
      },
      $unset: {
        suspendedAt: 1,
      },
    },
    { new: true }
  ).lean();

  if (!outlet) {
    throw ApiError.notFound('Outlet not found');
  }

  await writeAuditLog({
    actorId,
    role: actorRole,
    action: 'OUTLET_APPROVE',
    targetType: 'OUTLET',
    targetId: outletId,
  });

  return outlet;
};

export const suspendOutlet = async (outletId, actorId) => {
  const actorRole = await getActorRole(actorId);

  const outlet = await Outlet.findOneAndUpdate(
    { _id: outletId, deletedAt: null },
    {
      $set: {
        isActive: false,
        suspendedAt: new Date(),
      },
    },
    { new: true }
  ).lean();

  if (!outlet) {
    throw ApiError.notFound('Outlet not found');
  }

  await writeAuditLog({
    actorId,
    role: actorRole,
    action: 'OUTLET_SUSPEND',
    targetType: 'OUTLET',
    targetId: outletId,
  });

  return outlet;
};
