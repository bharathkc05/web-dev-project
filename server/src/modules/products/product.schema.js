// server/src/modules/products/product.schema.js
import { z } from 'zod';

const objectIdSchema = z.string().trim().regex(/^[a-fA-F0-9]{24}$/, 'Invalid id');

// Preprocess query parameter booleans
const booleanQuerySchema = z.preprocess((value) => {
  if (value === 'true' || value === true) return true;
  if (value === 'false' || value === false) return false;
  return value;
}, z.boolean());

/**
 * Strip HTML/script tags from a string to prevent stored XSS.
 * Fix #21: Applied to all free-text user input fields.
 */
const sanitizeString = (str) => (typeof str === 'string' ? str.replace(/<[^>]*>/g, '') : str);

const sanitizedString = (schema) =>
  schema.transform((val) => sanitizeString(val));

export const createMasterProductSchema = z.object({
  name: sanitizedString(z.string().trim().min(1, 'Product name is required').max(100)),
  description: sanitizedString(z.string().trim().max(500)).optional(),
  // Fix #20: category and quickTab are ObjectId refs to Category/QuickTab collections
  category: objectIdSchema,
  quickTab: objectIdSchema.optional(),
  isVeg: booleanQuerySchema.optional().default(false),
  ingredients: z.array(sanitizedString(z.string().trim())).optional().default([]),
  basePrice: z.coerce.number().nonnegative('Base price must be a non-negative number'),
  originalPrice: z.coerce.number().nonnegative('Original price must be a non-negative number').optional(),
});

export const activateProductSchema = z.object({
  masterProductId: objectIdSchema,
  price: z.coerce.number().nonnegative('Price must be a non-negative number'),
  originalPrice: z.coerce.number().nonnegative().optional(),
});

export const updateOutletProductSchema = z.object({
  price: z.coerce.number().nonnegative('Price must be a non-negative number').optional(),
  originalPrice: z.coerce.number().nonnegative().optional(),
  isAvailable: booleanQuerySchema.optional(),
});

export const updateMasterProductSchema = createMasterProductSchema.partial().extend({
  isActive: booleanQuerySchema.optional(),
});

export const offerSchema = z.object({
  code: z.string().trim().min(2, 'Code must be at least 2 characters').toUpperCase(),
  type: z.enum(['FLAT', 'PERCENT', 'BOGO'], {
    errorMap: () => ({ message: 'Type must be FLAT, PERCENT, or BOGO' }),
  }),
  value: z.coerce.number().nonnegative('Value must be a non-negative number'),
  minOrderValue: z.coerce.number().nonnegative('Minimum order value must be non-negative').default(0),
  expiryDate: z.coerce.date().refine((date) => date > new Date(), {
    message: 'Expiry date must be in the future',
  }),
  usageLimit: z.coerce.number().int().positive('Usage limit must be a positive integer'),
  maxDiscount: z.coerce.number().positive('Max discount must be a positive number').optional().nullable(),
});

export const personalizedCampaignSchema = offerSchema.extend({
  targetGroup: z.enum(['ALL', 'DORMANT_30_DAYS', 'LOYAL_5_PLUS_ORDERS', 'FRESH_USERS'], {
    errorMap: () => ({ message: 'Invalid target group' }),
  }),
});

export const reviewSchema = z.object({
  orderId: objectIdSchema,
  rating: z.coerce.number().int().min(1).max(5, 'Rating must be between 1 and 5'),
  // Fix #21: sanitize free-text review comments against stored XSS
  comment: sanitizedString(z.string().trim().max(500, 'Comment must not exceed 500 characters')).optional(),
});

export const productFilterSchema = z.object({
  outletId: objectIdSchema.optional(),
  // Fix #20: category filter now accepts an ObjectId (matching the MasterProduct model)
  category: objectIdSchema.optional(),
  quickTab: objectIdSchema.optional(),
  isAvailable: booleanQuerySchema.optional(),
  cursor: objectIdSchema.optional(),
  // Fix #25: cap limit at 100 to prevent heavy aggregation queries
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const idParamSchema = z.object({
  id: objectIdSchema,
});
