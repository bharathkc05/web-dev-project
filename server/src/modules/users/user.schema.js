import { z } from 'zod';

import { ROLES } from '../../shared/constants/roles.js';

const objectIdSchema = z.string().trim().regex(/^[a-fA-F0-9]{24}$/, 'Invalid id');
const booleanQuerySchema = z.preprocess((value) => {
  if (value === 'true' || value === true) {
    return true;
  }

  if (value === 'false' || value === false) {
    return false;
  }

  return value;
}, z.boolean());

export const suspendUserSchema = z.object({
  reason: z.string().trim().min(1, 'Reason is required'),
});

export const approveOutletSchema = z.object({}).strict();
export const idParamSchema = z.object({
  id: objectIdSchema,
});

export const userFilterSchema = z.object({
  role: z.enum(Object.values(ROLES)).optional(),
  isActive: booleanQuerySchema.optional(),
  cursor: objectIdSchema.optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const outletFilterSchema = z.object({
  isApproved: booleanQuerySchema.optional(),
  isActive: booleanQuerySchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const auditLogFilterSchema = z.object({
  actorId: objectIdSchema.optional(),
  action: z.string().trim().min(1).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
