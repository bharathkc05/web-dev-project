import { z } from 'zod';

export const emailSchema = z
  .string({ required_error: 'Email is required' })
  .email({ message: 'Invalid email address' });

export const passwordSchema = z
  .string({ required_error: 'Password is required' })
  .min(8, { message: 'Password must be at least 8 characters long' })
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  });

export const phoneSchema = z
  .string({ required_error: 'Phone number is required' })
  .regex(/^[6-9]\d{9}$/, { message: 'Invalid Indian phone number' });

export const indianPincodeSchema = z
  .string({ required_error: 'Pincode is required' })
  .regex(/^[1-9][0-9]{5}$/, { message: 'Invalid Indian pincode' });
