// server/src/modules/catalogue/catalogue.schema.js
import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().trim().min(1, 'Category name is required').max(60),
  imageUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  isActive: z.boolean().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

export const createQuickTabSchema = z.object({
  name: z.string().trim().min(1, 'Quick tab name is required').max(60),
  isActive: z.boolean().optional(),
});

export const updateQuickTabSchema = createQuickTabSchema.partial();

export const createBannerSchema = z.object({
  title: z.string().trim().min(1, 'Banner title is required').max(100),
  imageUrl: z.string().url('Must be a valid URL'),
  link: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  isActive: z.boolean().optional(),
});

export const updateBannerSchema = createBannerSchema.partial();
