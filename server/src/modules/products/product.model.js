// server/src/modules/products/product.model.js
import mongoose from 'mongoose';

// ==========================================
// 1. PRODUCT MODEL
// ==========================================
const productSchema = new mongoose.Schema(
  {
    masterProductId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MasterProduct',
      required: true,
      index: true,
    },
    outletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Outlet',
      required: true,
      index: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    originalPrice: {
      type: Number,
      min: 0,
    },
    isAvailable: {
      type: Boolean,
      default: true,
      index: true,
    },
    ratings: {
      avg: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      count: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
  },
  { timestamps: true }
);

// Compound indexes
productSchema.index({ outletId: 1, isAvailable: 1 });
// Enforce unique activation per outlet
productSchema.index({ masterProductId: 1, outletId: 1 }, { unique: true });

export const Product = mongoose.models.Product || mongoose.model('Product', productSchema, 'outletproducts');

// ==========================================
// 2. OFFER MODEL
// ==========================================
const offerSchema = new mongoose.Schema(
  {
    outletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Outlet',
      default: null,
      index: true,
    },
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['FLAT', 'PERCENT', 'BOGO'],
    },
    value: {
      type: Number,
      required: true,
      min: 0,
    },
    minOrderValue: {
      type: Number,
      default: 0,
      min: 0,
    },
    expiryDate: {
      type: Date,
      required: true,
      index: true,
    },
    usageLimit: {
      type: Number,
      required: true,
      min: 1,
    },
    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxDiscount: {
      type: Number,
      default: null,
      min: 0,
    },
    isPersonalized: {
      type: Boolean,
      default: false,
    },
    targetGroup: {
      type: String,
      enum: ['ALL', 'DORMANT_30_DAYS', 'LOYAL_5_PLUS_ORDERS', 'FRESH_USERS', null],
      default: null,
    },
    targetUsers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
  },
  { timestamps: true }
);

// Ensure the same offer code is unique per outlet
offerSchema.index({ outletId: 1, code: 1 }, { unique: true });

export const Offer = mongoose.models.Offer || mongoose.model('Offer', offerSchema);

// ==========================================
// 3. REVIEW MODEL
// ==========================================
const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },
  },
  { timestamps: true }
);

// A user can only review a product once
reviewSchema.index({ userId: 1, productId: 1 }, { unique: true });
// (Optional but highly recommended) A product in a specific order can only be reviewed once
reviewSchema.index({ orderId: 1, productId: 1 }, { unique: true });

export const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);

export default {
  Product,
  Offer,
  Review,
};
