// server/src/modules/products/product.model.js
import mongoose from 'mongoose';

// ==========================================
// 1. PRODUCT MODEL
// ==========================================
const productSchema = new mongoose.Schema(
  {
    outletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Outlet',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    category: {
      type: String,
      required: true,
      enum: ['BURGER', 'SIDE', 'BEVERAGE', 'DESSERT'],
      index: true,
    },
    imageUrl: {
      type: String,
      default: '',
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: '{VALUE} is not an integer value',
      },
      default: 0,
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
productSchema.index({ category: 1, outletId: 1 });

export const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

// ==========================================
// 2. OFFER MODEL
// ==========================================
const offerSchema = new mongoose.Schema(
  {
    outletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Outlet',
      required: true,
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
