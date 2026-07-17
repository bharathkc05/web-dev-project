// server/src/modules/products/offer.service.js
import { Offer } from './product.model.js';
import User from '../auth/auth.model.js';
import { Order } from '../orders/order.model.js';
import { ApiError } from '../../shared/utils/ApiError.js';
import { sendEmail } from '../../shared/utils/email.js';

/**
 * Validate offer code (read-only — for preview/UI display).
 * Does NOT increment usedCount.
 * @param {string} code - Coupon offer code
 * @param {string} outletId - Outlet ID
 * @param {number} subtotal - Subtotal amount of the order
 * @returns {Promise<Object>} - Validated Offer document (plain object)
 */
export const validateOffer = async (code, outletId, subtotal, userId = null) => {
  const offer = await Offer.findOne({
    outletId: { $in: [outletId, null] },
    code: code.toUpperCase(),
  });

  if (!offer) {
    throw ApiError.notFound('Offer code not found for this outlet');
  }

  if (offer.isPersonalized) {
    if (!userId) {
      throw ApiError.forbidden('This coupon is exclusive and not valid for your account');
    }

    let isValid = false;

    // Check explicit target users
    if (offer.targetUsers && offer.targetUsers.some(uid => uid.toString() === String(userId))) {
      isValid = true;
    }

    // Check dynamic rules if explicit check failed
    if (!isValid && offer.targetGroup) {
      const orderCount = await Order.countDocuments({ userId });
      if (offer.targetGroup === 'FRESH_USERS' && orderCount === 0) isValid = true;
      else if (offer.targetGroup === 'LOYAL_5_PLUS_ORDERS' && orderCount >= 5) isValid = true;
      else if (offer.targetGroup === 'ALL') isValid = true;
      else if (offer.targetGroup === 'DORMANT_30_DAYS') {
        const lastOrder = await Order.findOne({ userId }).sort({ createdAt: -1 });
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        if (lastOrder && lastOrder.createdAt < thirtyDaysAgo) isValid = true;
      }
    }

    if (!isValid) {
      throw ApiError.forbidden('This coupon is exclusive and not valid for your account');
    }

    // Per-user usage limit for personalized coupons
    const userUsageCount = await Order.countDocuments({ userId, couponCode: offer.code });
    if (userUsageCount >= offer.usageLimit) {
      throw ApiError.badRequest(`You have already used this coupon the maximum allowed number of times (${offer.usageLimit}).`);
    }
  } else {
    // Global usage limit for non-personalized coupons
    if (offer.usedCount >= offer.usageLimit) {
      throw ApiError.badRequest('Offer usage limit reached');
    }
  }

  const now = new Date();
  if (offer.expiryDate < now) {
    throw ApiError.badRequest('Offer has expired');
  }

  if (subtotal < offer.minOrderValue) {
    throw ApiError.badRequest(`Minimum order value of ₹${offer.minOrderValue} is required to use this offer`);
  }

  return offer.toJSON();
};

/**
 * Atomically increment offer usage count (called AFTER successful payment/COD).
 * @param {string} code - Coupon offer code
 * @param {string} outletId - Outlet ID
 * @returns {Promise<boolean>} - True if successfully incremented
 */
export const incrementOfferUsage = async (code, outletId) => {
  const offer = await Offer.findOneAndUpdate(
    {
      outletId,
      code: code.toUpperCase(),
      $expr: { $lt: ['$usedCount', '$usageLimit'] },
    },
    { $inc: { usedCount: 1 } },
    { new: true }
  );

  if (!offer) {
    return false;
  }
  return true;
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

  const offerPayload = { ...data };
  if (outletId) {
    offerPayload.outletId = outletId;
  }

  const offer = await Offer.create(offerPayload);

  return offer.toJSON();
};

export const createPersonalizedCampaign = async (outletId, data) => {
  const { targetGroup, ...offerData } = data;
  
  let targetUsers = [];
  if (targetGroup === 'FRESH_USERS') {
    const usersWithOrders = await Order.distinct('userId');
    targetUsers = await User.find({ _id: { $nin: usersWithOrders }, role: 'CUSTOMER', isActive: true }).select('_id email name notificationSettings');
  } else if (targetGroup === 'DORMANT_30_DAYS') {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentOrders = await Order.aggregate([
      { $group: { _id: '$userId', lastOrderDate: { $max: '$createdAt' } } },
      { $match: { lastOrderDate: { $lt: thirtyDaysAgo } } }
    ]);
    const userIds = recentOrders.map(o => o._id);
    targetUsers = await User.find({ _id: { $in: userIds }, role: 'CUSTOMER', isActive: true }).select('_id email name notificationSettings');
  } else if (targetGroup === 'LOYAL_5_PLUS_ORDERS') {
    const loyalOrders = await Order.aggregate([
      { $group: { _id: '$userId', count: { $sum: 1 } } },
      { $match: { count: { $gte: 5 } } }
    ]);
    const userIds = loyalOrders.map(o => o._id);
    targetUsers = await User.find({ _id: { $in: userIds }, role: 'CUSTOMER', isActive: true }).select('_id email name notificationSettings');
  } else if (targetGroup === 'ALL') {
    targetUsers = await User.find({ role: 'CUSTOMER', isActive: true }).select('_id email name notificationSettings');
  }

  if (targetUsers.length === 0) {
    throw ApiError.badRequest(`No users found for the target group: ${targetGroup}`);
  }

  const offer = await createOffer(outletId, {
    ...offerData,
    isPersonalized: true,
    targetGroup,
    targetUsers: targetUsers.map(u => u._id)
  });

  // Send emails to targeted users asynchronously
  targetUsers.forEach(user => {
    const wantsOffers = user.notificationSettings?.exclusiveOffers !== false;
    
    if (user.email && wantsOffers) {
      const emailHtml = `
        <div style="font-family: sans-serif; text-align: center; padding: 40px; background: #fdf2f8; border-radius: 10px;">
          <h1 style="color: #be185d;">Special Offer Just For You, ${user.name?.split(' ')[0] || 'Foodie'}!</h1>
          <p style="font-size: 18px; color: #333;">We have a personalized coupon waiting for you in your cart.</p>
          <div style="margin: 30px auto; background: white; border: 2px dashed #be185d; padding: 20px; font-size: 24px; font-weight: bold; color: #be185d; display: inline-block; letter-spacing: 2px;">
            ${offerData.code}
          </div>
          <p style="font-size: 16px; color: #555;">Log into your Velvet Bytes account and apply this code at checkout.</p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/cart" style="display: inline-block; margin-top: 20px; background: #ea580c; color: white; text-decoration: none; padding: 12px 30px; border-radius: 30px; font-weight: bold;">Order Now</a>
        </div>
      `;
      sendEmail({
        to: user.email,
        subject: `🎁 A special treat for you! Coupon code ${offerData.code} inside`,
        html: emailHtml
      }).catch(err => console.error('Failed to send coupon email:', err));
    }
  });

  return {
    offer,
    usersTargeted: targetUsers.length
  };
};

/**
 * Get all active offers for a specific outlet (for customers to see available coupons)
 * @param {string} outletId - Outlet ID
 * @returns {Promise<Array>} - Array of active Offer documents
 */
export const getActiveOffers = async (outletId, userId = null) => {
  const now = new Date();
  
  const query = {
    outletId: { $in: [outletId, null] },
    expiryDate: { $gt: now },
  };

  let userGroups = ['ALL'];
  if (userId) {
    const orderCount = await Order.countDocuments({ userId });
    if (orderCount === 0) {
      userGroups.push('FRESH_USERS');
    } else {
      if (orderCount >= 5) {
        userGroups.push('LOYAL_5_PLUS_ORDERS');
      }
      const lastOrder = await Order.findOne({ userId }).sort({ createdAt: -1 });
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      if (lastOrder && lastOrder.createdAt < thirtyDaysAgo) {
        userGroups.push('DORMANT_30_DAYS');
      }
    }
  }

  const offers = await Offer.find(query).sort({ value: -1 });
  const validOffers = [];

  for (const offer of offers) {
    if (offer.isPersonalized) {
      if (!userId) continue;

      let isValid = false;
      if (offer.targetUsers && offer.targetUsers.some(uid => uid.toString() === String(userId))) {
        isValid = true;
      } else if (offer.targetGroup && userGroups.includes(offer.targetGroup)) {
        isValid = true;
      }

      if (isValid) {
        const userUsageCount = await Order.countDocuments({ userId, couponCode: offer.code });
        if (userUsageCount < offer.usageLimit) {
          validOffers.push(offer);
        }
      }
    } else {
      if (offer.usedCount < offer.usageLimit) {
        validOffers.push(offer);
      }
    }
  }

  return validOffers;
};

export const updateOffer = async (offerId, outletId, data) => {
  const offer = await Offer.findOneAndUpdate(
    { _id: offerId, outletId },
    { $set: data },
    { new: true, runValidators: true }
  );
  if (!offer) {
    throw ApiError.notFound('Offer not found');
  }
  return offer;
};

export const deleteOffer = async (offerId, outletId) => {
  const offer = await Offer.findOneAndDelete({ _id: offerId, outletId });
  if (!offer) {
    throw ApiError.notFound('Offer not found');
  }
  return offer;
};

export const getOffers = async (outletId) => {
  const offers = await Offer.find({ outletId }).sort({ createdAt: -1 }).lean();
  return offers;
};

export default {
  validateOffer,
  incrementOfferUsage,
  calculateDiscount,
  createOffer,
  createPersonalizedCampaign,
  updateOffer,
  deleteOffer,
  getOffers,
  getActiveOffers
};
