import mongoose from 'mongoose';

const outletSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    storeTiming: {
      type: String,
      trim: true,
    },
    availableServices: [{
      type: String,
      enum: ['Takeaway', 'Dine-in', 'Delivery'],
    }],
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: false
      },
      coordinates: {
        type: [Number],
        required: false
      }
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    isApproved: {
      type: Boolean,
      default: false,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    suspendedAt: {
      type: Date,
      default: null,
    },
    deletedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  { timestamps: true }
);
outletSchema.index({ isApproved: 1, isActive: 1, createdAt: -1 });
outletSchema.index({ location: '2dsphere' });

export default mongoose.models.Outlet || mongoose.model('Outlet', outletSchema);
