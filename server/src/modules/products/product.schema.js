// server/src/modules/products/product.schema.js
import { z } from 'zod';

const objectIdSchema = z.string().trim().regex(/^[a-fA-F0-9]{24}$/, 'Invalid id');

// Preprocess query parameter booleans
const booleanQuerySchema = z.preprocess((value) => {
  if (value === 'true' || value === true) return true;
  if (value === 'false' || value === false) return false;
  return value;
}, z.boolean());

export const createProductSchema = z.object({
  outletId: objectIdSchema,
  name: z.string().trim().min(1, 'Product name is required').max(100),
  description: z.string().trim().max(500).optional(),
  category: z.enum(['BURGER', 'SIDE', 'BEVERAGE', 'DESSERT'], {
    errorMap: () => ({ message: 'Category must be BURGER, SIDE, BEVERAGE, or DESSERT' }),
  }),
  price: z.coerce.number().positive('Price must be a positive number'),
  stock: z.coerce.number().int().nonnegative('Stock must be a non-negative integer').default(0),
});

export const updateProductSchema = createProductSchema.partial().extend({
  isAvailable: z.boolean().optional(),
});

export const offerSchema = z.object({
  code: z.string().trim().min(2, 'Code must be at least 2 characters').toUpperCase(),
  type: z.enum(['FLAT', 'PERCENT', 'BOGO'], {
    errorMap: () => ({ message: 'Type must be FLAT, PERCENT, or BOGO' }),
  }),
  value: z.coerce.number().positive('Value must be a positive number'),
  minOrderValue: z.coerce.number().nonnegative('Minimum order value must be non-negative').default(0),
  expiryDate: z.coerce.date().refine((date) => date > new Date(), {
    message: 'Expiry date must be in the future',
  }),
  usageLimit: z.coerce.number().int().positive('Usage limit must be a positive integer'),
  maxDiscount: z.coerce.number().positive('Max discount must be a positive number').optional().nullable(),
});

export const reviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5, 'Rating must be between 1 and 5'),
  comment: z.string().trim().max(500, 'Comment must not exceed 500 characters').optional(),
});

export const productFilterSchema = z.object({
  outletId: objectIdSchema.optional(),
  category: z.enum(['BURGER', 'SIDE', 'BEVERAGE', 'DESSERT']).optional(),
  isAvailable: booleanQuerySchema.optional(),
  cursor: objectIdSchema.optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const idParamSchema = z.object({
  id: objectIdSchema,
});
