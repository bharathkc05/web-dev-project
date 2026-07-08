import mongoose from 'mongoose';

const masterProductSchema = new mongoose.Schema(
  {
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
    imageUrl: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      required: true,
      enum: ['BURGERS', 'WRAPS', 'SNACKS', 'BEVERAGES', 'DESSERTS', 'BK CAFE', 'MEALS'],
      index: true,
    },
    quickTab: {
      type: String,
      enum: ['PERI PERI FEST', 'CRAZY DEALS', 'STARTING @ 59', 'MIX N MATCH COMBOS', 'WHOPPER DELUXE', 'ORIGINAL WHOPPER', 'SUPER SAVER MEALS', 'BURGERS & WRAPS', 'SNACKS', 'BEVERAGES', 'DESSERTS', 'BK CAFE'],
      index: true,
    },
    isVeg: {
      type: Boolean,
      default: false,
    },
    ingredients: {
      type: [String],
      default: [],
    },
    basePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    originalPrice: {
      type: Number,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Indexes for common queries
masterProductSchema.index({ category: 1, isActive: 1 });

export const MasterProduct = mongoose.models.MasterProduct || mongoose.model('MasterProduct', masterProductSchema);
export default MasterProduct;
