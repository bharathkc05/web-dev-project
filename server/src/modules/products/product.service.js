// server/src/modules/products/product.service.js
import mongoose from 'mongoose';
import { Product, Offer, Review } from './product.model.js';
import Order from '../../shared/models/order.model.js';
import { getCache, setCache, deleteCache, deleteCachePattern } from '../../shared/utils/cacheHelper.js';
import { uploadImage, deleteImage } from '../../shared/utils/cloudinary.js';
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
const invalidateProductCache = async (outletId = null, productId = null) => {
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
  const isAvailable = filters.isAvailable !== false ? 'avail' : 'all';
  const cursorStr = cursor || 'start';
  
  const cacheKey = `products:${outletId}:${category}:${isAvailable}:${cursorStr}:${limit}`;
  
  const cachedData = await getCache(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  // Build DB query
  const query = {};
  if (filters.outletId) {
    query.outletId = new mongoose.Types.ObjectId(filters.outletId);
  }
  if (filters.category) {
    query.category = filters.category;
  }
  if (filters.isAvailable !== undefined) {
    query.isAvailable = filters.isAvailable;
  }

  if (cursor) {
    query._id = { $lt: new mongoose.Types.ObjectId(cursor) };
  }

  // Fetch from database
  const items = await Product.find(query)
    .sort({ _id: -1 })
    .limit(limit + 1)
    .lean();

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

  const product = await Product.findById(id).lean();
  if (!product) {
    throw ApiError.notFound('Product not found');
  }

  await setCache(key, product, CACHE_TTL_PRODUCT);
  return product;
};

/**
 * Create product
 */
export const createProduct = async (data, imageFile = null) => {
  let imageUrl = '';
  if (imageFile) {
    const uploadResult = await uploadImage(imageFile, 'products');
    imageUrl = uploadResult.secure_url;
  }

  const product = await Product.create({
    ...data,
    imageUrl,
  });

  // Invalidate caches
  await invalidateProductCache(product.outletId);

  return product.toJSON();
};

/**
 * Update product
 */
export const updateProduct = async (id, data, user, imageFile = null) => {
  const product = await Product.findById(id);
  if (!product) {
    throw ApiError.notFound('Product not found');
  }

  // Ownership check
  if (user.role !== ROLES.ADMIN && String(user.outletId) !== String(product.outletId)) {
    throw ApiError.forbidden('You do not have permission to modify this product');
  }

  const updateFields = { ...data };

  if (imageFile) {
    // If old image exists, we would ideally delete it
    if (product.imageUrl) {
      const publicId = product.imageUrl.split('/').pop().split('.')[0];
      await deleteImage(`products/${publicId}`).catch(() => {}); // ignore error
    }
    
    const uploadResult = await uploadImage(imageFile, 'products');
    updateFields.imageUrl = uploadResult.secure_url;
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    id,
    { $set: updateFields },
    { new: true }
  ).lean();

  // Invalidate cache
  await invalidateProductCache(product.outletId, id);

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

  const updatedProduct = await Product.findByIdAndUpdate(
    id,
    { $set: { isAvailable: false } },
    { new: true }
  ).lean();

  // Invalidate cache
  await invalidateProductCache(product.outletId, id);

  return updatedProduct;
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

  // Aggregate Reviews grouped by product
  let popular = await Review.aggregate([
    { $group: { _id: '$productId', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'product',
      },
    },
    { $unwind: '$product' },
    {
      $project: {
        _id: '$product._id',
        outletId: '$product.outletId',
        name: '$product.name',
        description: '$product.description',
        category: '$product.category',
        imageUrl: '$product.imageUrl',
        price: '$product.price',
        stock: '$product.stock',
        isAvailable: '$product.isAvailable',
        ratings: '$product.ratings',
        reviewCount: '$count',
      },
    },
  ]);

  // Fallback to top rated products if reviews collection is empty/thin
  if (popular.length === 0) {
    const products = await Product.find({ isAvailable: true })
      .sort({ 'ratings.avg': -1, 'ratings.count': -1 })
      .limit(10)
      .lean();
      
    popular = products.map((p) => ({
      ...p,
      reviewCount: p.ratings.count,
    }));
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
  await invalidateProductCache(product.outletId, productId);

  return review.toJSON();
};

export { createOffer, validateOffer } from './offer.service.js';
