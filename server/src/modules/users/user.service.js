import mongoose from 'mongoose';

import { USER_ERRORS } from '../../shared/constants/errorMessages.js';
import { PAYMENT_STATUS } from '../../shared/constants/paymentStatuses.js';
import User from '../auth/auth.model.js';
import AuditLog from '../../shared/models/auditLog.model.js';
import Outlet from '../../shared/models/outlet.model.js';
import Order from '../../shared/models/order.model.js';
import { Product } from '../products/product.model.js';
import { MasterProduct } from '../../shared/models/masterProduct.model.js';
import { ApiError } from '../../shared/utils/ApiError.js';
import { deleteCache } from '../../shared/utils/cacheHelper.js';

const PROFILE_CACHE_KEY = (userId) => `user_profile:${userId}`;

const buildCursorFilter = (cursor) => {
  if (!cursor) {
    return {};
  }

  return {
    _id: {
      $lt: new mongoose.Types.ObjectId(cursor),
    },
  };
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

const getActorRole = async (actorId) => {
  const actor = await User.findById(actorId).select('role').lean();
  if (!actor) {
    throw ApiError.notFound('Actor not found');
  }

  return actor.role;
};

const invalidateUserProfileCache = async (userId) => {
  await deleteCache(PROFILE_CACHE_KEY(userId));
};

const buildUserFilters = (filters = {}) => {
  const query = { isDeleted: { $ne: true } };

  if (filters.role) {
    query.role = filters.role;
  }

  if (typeof filters.isActive === 'boolean') {
    query.isActive = filters.isActive;
  }

  return query;
};

export const getUsers = async (filters = {}, cursor) => {
  const limit = filters.limit || 20;
  const query = {
    ...buildUserFilters(filters),
    ...buildCursorFilter(cursor || filters.cursor),
  };

  const users = await User.find(query)
    .sort({ _id: -1 })
    .limit(limit + 1)
    .lean();

  const hasNextPage = users.length > limit;
  const items = hasNextPage ? users.slice(0, limit) : users;
  const nextCursor = hasNextPage ? String(items[items.length - 1]._id) : null;

  return {
    items,
    pageInfo: {
      nextCursor,
      hasNextPage,
      limit,
    },
  };
};

export const suspendUser = async (targetId, actorId, reason) => {
  const actorRole = await getActorRole(actorId);

  const user = await User.findOneAndUpdate(
    { _id: targetId, isDeleted: { $ne: true } },
    {
      $set: {
        isActive: false,
        suspendedAt: new Date(),
        suspendedBy: actorId,
        suspensionReason: reason,
      },
    },
    { new: true }
  ).lean();

  if (!user) {
    throw ApiError.notFound(USER_ERRORS.NOT_FOUND);
  }

  await invalidateUserProfileCache(targetId);
  await writeAuditLog({
    actorId,
    role: actorRole,
    action: 'USER_SUSPEND',
    targetType: 'USER',
    targetId,
    metadata: { reason },
  });

  return user;
};

export const deleteUser = async (targetId, actorId) => {
  const actorRole = await getActorRole(actorId);

  const user = await User.findOneAndUpdate(
    { _id: targetId, isDeleted: { $ne: true } },
    {
      $set: {
        isActive: false,
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: actorId,
      },
    },
    { new: true }
  ).lean();

  if (!user) {
    throw ApiError.notFound(USER_ERRORS.NOT_FOUND);
  }

  await invalidateUserProfileCache(targetId);
  await writeAuditLog({
    actorId,
    role: actorRole,
    action: 'USER_DELETE',
    targetType: 'USER',
    targetId,
  });

  return user;
};

export const unsuspendUser = async (targetId, actorId) => {
  const actorRole = await getActorRole(actorId);

  const user = await User.findOneAndUpdate(
    { _id: targetId, isDeleted: { $ne: true } },
    {
      $set: {
        isActive: true,
      },
      $unset: {
        suspendedAt: 1,
        suspendedBy: 1,
        suspensionReason: 1,
      },
    },
    { new: true }
  ).lean();

  if (!user) {
    throw ApiError.notFound(USER_ERRORS.NOT_FOUND);
  }

  await invalidateUserProfileCache(targetId);
  await writeAuditLog({
    actorId,
    role: actorRole,
    action: 'USER_UNSUSPEND',
    targetType: 'USER',
    targetId,
  });

  return user;
};

export const assignManager = async (targetId, outletId, actorId) => {
  const actorRole = await getActorRole(actorId);

  // Verify outlet exists
  const outlet = await Outlet.findOne({ _id: outletId, deletedAt: null }).lean();
  if (!outlet) {
    throw ApiError.notFound('Outlet not found');
  }

  const user = await User.findOneAndUpdate(
    { _id: targetId, isDeleted: { $ne: true } },
    {
      $set: {
        role: 'OUTLET_MANAGER',
        outletId: outletId,
      },
    },
    { new: true }
  ).lean();

  if (!user) {
    throw ApiError.notFound(USER_ERRORS.NOT_FOUND);
  }

  await invalidateUserProfileCache(targetId);
  await writeAuditLog({
    actorId,
    role: actorRole,
    action: 'USER_ASSIGN_MANAGER',
    targetType: 'USER',
    targetId,
    metadata: { outletId },
  });

  return user;
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

export const getPlatformAnalytics = async () => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [totalUsers, totalOrders, revenueSummary, activeOutlets, masterCatalogueSize, topActivatedProducts, dailyOrders] = await Promise.all([
    User.countDocuments({ isDeleted: { $ne: true } }),
    Order.countDocuments(),
    Order.aggregate([
      { $match: { paymentStatus: PAYMENT_STATUS.PAID } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
        },
      },
    ]),
    Outlet.countDocuments({ isActive: true, deletedAt: null }),
    MasterProduct.countDocuments(),
    Product.aggregate([
      { $group: { _id: '$masterProductId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'masterproducts', localField: '_id', foreignField: '_id', as: 'master' } },
      { $unwind: '$master' },
      { $project: { _id: 1, count: 1, name: '$master.name' } }
    ]),
    Order.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          orders: { $sum: 1 },
        }
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          date: '$_id',
          orders: 1
        }
      }
    ])
  ]);

  return {
    totalUsers,
    totalRevenue: revenueSummary[0]?.totalRevenue || 0,
    totalOrders,
    activeOutlets,
    masterCatalogueSize,
    topActivatedProducts,
    dailyOrders,
  };
};

export const getAuditLogs = async (filters = {}) => {
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const query = {};

  if (filters.actorId) {
    query.actorId = filters.actorId;
  }

  if (filters.action) {
    query.action = filters.action;
  }

  if (filters.startDate || filters.endDate) {
    query.createdAt = {};
    if (filters.startDate) {
      query.createdAt.$gte = filters.startDate;
    }
    if (filters.endDate) {
      query.createdAt.$lte = filters.endDate;
    }
  }

  const [items, total] = await Promise.all([
    AuditLog.find(query)
      .sort({ createdAt: -1, _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    AuditLog.countDocuments(query),
  ]);

  return {
    items,
    pageInfo: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};
