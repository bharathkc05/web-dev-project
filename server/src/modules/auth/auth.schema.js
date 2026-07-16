// server/src/modules/auth/auth.schema.js
import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

const nameSchema = z.string().trim().min(2, 'Name must be at least 2 characters long').max(50, 'Name must be at most 50 characters long');
const emailSchema = z.string().trim().email('Enter a valid email address');
const phoneSchema = z.string().trim().regex(/^\d{10}$/, 'Phone must be exactly 10 digits');

export const signupSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  phone: phoneSchema.optional(),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = signupSchema.pick({ name: true, email: true, password: true, phone: true }).partial();

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  password: passwordSchema,
});