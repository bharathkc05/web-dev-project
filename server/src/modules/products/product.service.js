// server/src/modules/products/product.service.js
import mongoose from 'mongoose';
import { Product, Review } from './product.model.js';
import { Order } from '../orders/order.model.js';
import { getCache, setCache, deleteCache, deleteCachePattern } from '../../shared/utils/cacheHelper.js';

import { ApiError } from '../../shared/utils/ApiError.js';
import { ORDER_STATUS } from '../../shared/constants/orderStatuses.js';
import { ROLES } from '../../shared/constants/roles.js';

const CACHE_TTL_PRODUCT = 3600; // 1 hour
const CACHE_TTL_PRODUCT_LIST = 300; // 5 minutes
const CACHE_TTL_POPULAR = 1800; // 30 minutes

/**
 * Generate Redis keys
 */
const productCacheKey = (id) => `product:${id}`;
const popularCacheKey = () => `popular_products`;
const productListPattern = 'products:*';

/**
 * Helper to invalidate Redis caches
 */
const invalidateProductCache = async (productId = null) => {
  if (productId) {
    await deleteCache(productCacheKey(productId));
  }

  // Get and delete all keys matching the list pattern
  await deleteCachePattern(productListPattern);

  // Invalidate popular products cache
  await deleteCache(popularCacheKey());
};

/**
 * Get all products (with cursor-based pagination and filtering)
 */
export const getAllProducts = async (filters = {}, cursor = null, limit = 20) => {
  const outletId = filters.outletId || 'all';
  const category = filters.category || 'all';
  const quickTab = filters.quickTab || 'all';
  const isAvailable = filters.isAvailable !== false ? 'avail' : 'all';
  const cursorStr = cursor || 'start';
  
  const cacheKey = `products:${outletId}:${category}:${quickTab}:${isAvailable}:${cursorStr}:${limit}`;
  
  const cachedData = await getCache(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  const matchOutlet = {};
  if (filters.outletId) {
    matchOutlet.outletId = new mongoose.Types.ObjectId(filters.outletId);
  }
  if (filters.isAvailable !== undefined) {
    matchOutlet.isAvailable = filters.isAvailable;
  }
  if (cursor) {
    matchOutlet._id = { $lt: new mongoose.Types.ObjectId(cursor) };
  }

  const pipeline = [
    { $match: matchOutlet },
    {
      $lookup: {
        from: 'masterproducts',
        localField: 'masterProductId',
        foreignField: '_id',
        as: 'master',
      }
    },
    { $unwind: '$master' }
  ];

  if (filters.category) {
    pipeline.push({ $match: { 'master.category': new mongoose.Types.ObjectId(filters.category) } });
  }
  if (filters.quickTab) {
    pipeline.push({ $match: { 'master.quickTab': new mongoose.Types.ObjectId(filters.quickTab) } });
  }

  pipeline.push({ $sort: { _id: -1 } });
  pipeline.push({ $limit: limit + 1 });

  pipeline.push({
    $project: {
      _id: 1,
      outletId: 1,
      masterProductId: 1,
      price: 1,
      isAvailable: 1,
      ratings: 1,
      createdAt: 1,
      updatedAt: 1,
      name: '$master.name',
      description: '$master.description',
      category: '$master.category',
      quickTab: '$master.quickTab',
      imageUrl: '$master.imageUrl',
      isVeg: '$master.isVeg',
      ingredients: '$master.ingredients',
    }
  });

  const items = await Product.aggregate(pipeline);

  const hasNextPage = items.length > limit;
  const slicedItems = hasNextPage ? items.slice(0, limit) : items;
  const nextCursor = hasNextPage ? String(slicedItems[slicedItems.length - 1]._id) : null;

  const result = {
    items: slicedItems,
    pageInfo: {
      nextCursor,
      hasNextPage,
      limit,
    },
  };

  // Cache results
  await setCache(cacheKey, result, CACHE_TTL_PRODUCT_LIST);

  return result;
};

/**
 * Get single product by ID
 */
export const getProductById = async (id) => {
  const key = productCacheKey(id);
  
  const cachedProduct = await getCache(key);
  if (cachedProduct) {
    return cachedProduct;
  }

  const pipeline = [
    { $match: { _id: new mongoose.Types.ObjectId(id) } },
    {
      $lookup: {
        from: 'masterproducts',
        localField: 'masterProductId',
        foreignField: '_id',
        as: 'master',
      }
    },
    { $unwind: '$master' },
    {
      $project: {
        _id: 1,
        outletId: 1,
        masterProductId: 1,
        price: 1,
        isAvailable: 1,
        ratings: 1,
        createdAt: 1,
        updatedAt: 1,
        name: '$master.name',
        description: '$master.description',
        category: '$master.category',
        quickTab: '$master.quickTab',
        imageUrl: '$master.imageUrl',
        isVeg: '$master.isVeg',
        ingredients: '$master.ingredients',
      }
    }
  ];

  const results = await Product.aggregate(pipeline);
  const product = results[0];

  if (!product) {
    throw ApiError.notFound('Product not found');
  }

  await setCache(key, product, CACHE_TTL_PRODUCT);
  return product;
};

/**
 * Activate product for an outlet
 */
export const activateProduct = async (data) => {
  const product = await Product.create({
    masterProductId: data.masterProductId,
    outletId: data.outletId,
    price: data.price,
    isAvailable: true,
  });

  // Invalidate caches
  await invalidateProductCache();

  return product.toJSON();
};

/**
 * Activate ALL available products for an outlet
 */
export const activateAllProductsForOutlet = async (outletId) => {
  const availableProducts = await getAvailableMasterProducts(outletId);
  
  if (!availableProducts.length) {
    return { addedCount: 0 };
  }

  const productsToInsert = availableProducts.map(masterProduct => ({
    masterProductId: masterProduct._id,
    outletId: new mongoose.Types.ObjectId(outletId),
    price: masterProduct.basePrice,
    isAvailable: true,
  }));

  await Product.insertMany(productsToInsert);

  // Invalidate caches
  await invalidateProductCache();

  return { addedCount: productsToInsert.length };
};

/**
 * Get available master products for an outlet
 */
export const getAvailableMasterProducts = async (outletId) => {
  // Get all master product IDs already activated by this outlet
  const activatedProducts = await Product.find({ outletId }, { masterProductId: 1 }).lean();
  const activatedIds = activatedProducts.map(p => p.masterProductId);

  // Find all active master products NOT in that list
  const { MasterProduct } = await import('./masterProduct.model.js');
  const available = await MasterProduct.find({
    _id: { $nin: activatedIds },
    isActive: true,
  }).sort({ _id: -1 }).lean();

  return available;
};

/**
 * Update outlet product
 */
export const updateOutletProduct = async (id, data, user) => {
  const product = await Product.findById(id);
  if (!product) {
    throw ApiError.notFound('Product not found');
  }

  // Ownership check
  if (user.role !== ROLES.ADMIN && String(user.outletId) !== String(product.outletId)) {
    throw ApiError.forbidden('You do not have permission to modify this product');
  }

  const updateFields = { ...data };

  const updatedProduct = await Product.findByIdAndUpdate(
    id,
    { $set: updateFields },
    { new: true }
  ).lean();

  // Invalidate cache
  await invalidateProductCache(id);

  return updatedProduct;
};

/**
 * Soft delete product
 */
export const softDeleteProduct = async (id, user) => {
  const product = await Product.findById(id);
  if (!product) {
    throw ApiError.notFound('Product not found');
  }

  // Ownership check
  if (user.role !== ROLES.ADMIN && String(user.outletId) !== String(product.outletId)) {
    throw ApiError.forbidden('You do not have permission to delete this product');
  }

  const deletedProduct = await Product.findByIdAndDelete(id).lean();

  // Invalidate cache
  await invalidateProductCache(id);

  return deletedProduct;
};

/**
 * Get popular products (aggregate by review counts, fall back to ratings)
 */
export const getPopularProducts = async () => {
  const key = popularCacheKey();
  
  const cachedPopular = await getCache(key);
  if (cachedPopular) {
    return cachedPopular;
  }

  let popular = await Review.aggregate([
    { $group: { _id: '$productId', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'outletproducts',
        localField: '_id',
        foreignField: '_id',
        as: 'product',
      },
    },
    { $unwind: '$product' },
    {
      $lookup: {
        from: 'masterproducts',
        localField: 'product.masterProductId',
        foreignField: '_id',
        as: 'master',
      }
    },
    { $unwind: '$master' },
    {
      $project: {
        _id: '$product._id',
        outletId: '$product.outletId',
        masterProductId: '$product.masterProductId',
        name: '$master.name',
        description: '$master.description',
        category: '$master.category',
        quickTab: '$master.quickTab',
        imageUrl: '$master.imageUrl',
        isVeg: '$master.isVeg',
        price: '$product.price',
        isAvailable: '$product.isAvailable',
        ratings: '$product.ratings',
        reviewCount: '$count',
      },
    },
  ]);

  // Fallback to top rated products if reviews collection is empty/thin
  if (popular.length === 0) {
    const pipeline = [
      { $match: { isAvailable: true } },
      { $sort: { 'ratings.avg': -1, 'ratings.count': -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'masterproducts',
          localField: 'masterProductId',
          foreignField: '_id',
          as: 'master',
        }
      },
      { $unwind: '$master' },
      {
        $project: {
          _id: 1,
          outletId: 1,
          masterProductId: 1,
          price: 1,
          isAvailable: 1,
          ratings: 1,
          name: '$master.name',
          description: '$master.description',
          category: '$master.category',
          quickTab: '$master.quickTab',
          imageUrl: '$master.imageUrl',
          isVeg: '$master.isVeg',
          reviewCount: '$ratings.count',
        }
      }
    ];
    popular = await Product.aggregate(pipeline);
  }

  await setCache(key, popular, CACHE_TTL_POPULAR);
  return popular;
};

/**
 * Submit product review
 */
export const submitReview = async (productId, userId, orderId, data) => {
  const product = await Product.findById(productId);
  if (!product) {
    throw ApiError.notFound('Product not found');
  }

  // Verify order exists, belongs to user, and is DELIVERED
  const order = await Order.findOne({ _id: orderId, userId });
  if (!order) {
    throw ApiError.notFound('Order not found for this user');
  }
  
  if (order.orderStatus !== ORDER_STATUS.DELIVERED) {
    throw ApiError.badRequest('You can only review products from delivered orders');
  }

  // Check if review already exists for this order/product
  const existingReview = await Review.findOne({ orderId, productId });
  if (existingReview) {
    throw ApiError.conflict('You have already reviewed this product for this purchase');
  }

  // Create review
  const review = await Review.create({
    userId,
    productId,
    orderId,
    rating: data.rating,
    comment: data.comment || '',
  });

  // Atomically update product ratings
  const stats = await Review.aggregate([
    { $match: { productId: new mongoose.Types.ObjectId(productId) } },
    { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  const avg = stats[0]?.avgRating || 0;
  const count = stats[0]?.count || 0;

  await Product.findByIdAndUpdate(productId, {
    $set: {
      'ratings.avg': Math.round(avg * 10) / 10,
      'ratings.count': count,
    },
  });

  // Invalidate product caches
  await invalidateProductCache(productId);

  return review.toJSON();
};

export { 
  createOffer, 
  validateOffer, 
  incrementOfferUsage, 
  updateOffer, 
  deleteOffer, 
  getOffers, 
  getActiveOffers,
  createPersonalizedCampaign
} from './offer.service.js';

