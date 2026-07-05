// server/src/modules/auth/auth.model.js
import mongoose from 'mongoose';
import { ROLES } from '../../shared/constants/roles.js';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.CUSTOMER,
      index: true,
    },
    outletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Outlet',
      default: null,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    avatar: { type: String },
    isActive: { type: Boolean, default: true, index: true },
    isEmailVerified: { type: Boolean, default: false },
    lastLoginAt: { type: Date },
    refreshTokenHash: { type: String, select: false },
    refreshTokenExpiresAt: { type: Date, select: false },
  },
  { timestamps: true }
);

userSchema.index({ role: 1, outletId: 1 });

userSchema.virtual('permissions').get(function () {
  const { ROLE_PERMISSIONS } = require('../../shared/constants/roles.js');
  return ROLE_PERMISSIONS[this.role] || [];
});

userSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret.passwordHash;
    delete ret.refreshTokenHash;
    delete ret.refreshTokenExpiresAt;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model('User', userSchema);