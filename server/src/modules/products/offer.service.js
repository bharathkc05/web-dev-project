// server/src/modules/products/offer.service.js
import { Offer } from './product.model.js';
import { ApiError } from '../../shared/utils/ApiError.js';

/**
 * Validate offer code
 * @param {string} code - Coupon offer code
 * @param {string} outletId - Outlet ID
 * @param {number} subtotal - Subtotal amount of the order
 * @returns {Promise<Object>} - Validated Offer document (plain object)
 */
export const validateOffer = async (code, outletId, subtotal) => {
  const offer = await Offer.findOne({
    outletId,
    code: code.toUpperCase(),
  });

  if (!offer) {
    throw ApiError.notFound('Offer code not found for this outlet');
  }

  const now = new Date();
  if (offer.expiryDate < now) {
    throw ApiError.badRequest('Offer has expired');
  }

  if (offer.usedCount >= offer.usageLimit) {
    throw ApiError.badRequest('Offer usage limit reached');
  }

  if (subtotal < offer.minOrderValue) {
    throw ApiError.badRequest(`Minimum order value of $${offer.minOrderValue} is required to use this offer`);
  }

  return offer.toJSON();
};

/**
 * Calculate the discount value for a coupon offer
 * @param {Object} offer - Offer document/object
 * @param {Array} items - List of items with price and qty
 * @param {number} subtotal - Subtotal amount of the order
 * @returns {number} - Calculated discount amount
 */
export const calculateDiscount = (offer, items, subtotal) => {
  if (offer.type === 'FLAT') {
    return Math.min(offer.value, subtotal);
  }

  if (offer.type === 'PERCENT') {
    let discount = subtotal * (offer.value / 100);
    if (offer.maxDiscount) {
      discount = Math.min(discount, offer.maxDiscount);
    }
    return Math.min(discount, subtotal);
  }

  if (offer.type === 'BOGO') {
    // Flatten individual item prices based on quantity
    const flatPrices = items.flatMap((item) => {
      const qty = item.qty || item.quantity || 0;
      return Array(qty).fill(item.price);
    });

    if (flatPrices.length < 2) {
      return 0;
    }

    // Sort ascending to get the cheapest items first
    flatPrices.sort((a, b) => a - b);

    // Buy 1 Get 1 free: for every pair, the cheaper one is free
    const freeCount = Math.floor(flatPrices.length / 2);
    const discount = flatPrices.slice(0, freeCount).reduce((sum, price) => sum + price, 0);

    return Math.min(discount, subtotal);
  }

  return 0;
};

export const createOffer = async (outletId, data) => {
  const existingOffer = await Offer.findOne({
    outletId,
    code: data.code.toUpperCase(),
  });

  if (existingOffer) {
    throw ApiError.conflict('An offer with this code already exists for this outlet');
  }

  const offer = await Offer.create({
    ...data,
    outletId,
  });

  return offer.toJSON();
};

export const getOffers = async (outletId) => {
  const offers = await Offer.find({ outletId }).sort({ createdAt: -1 }).lean();
  return offers;
};

export default {
  validateOffer,
  calculateDiscount,
  createOffer,
  getOffers,
};
