// server/src/config/env.js
import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables from .env file
dotenv.config();

const durationPattern = /^\d+[mhd]$/;

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  MONGODB_URI: z.string().url(),
  REDIS_URL: z.string().url(),
  CLOUDINARY_URL: z.string().url(),
  JWT_SECRET: z.string().min(32).optional(),
  JWT_ACCESS_SECRET: z.string().min(32).optional(),
  JWT_EXPIRES_IN: z.string().regex(durationPattern).default('15m'),
  REFRESH_SECRET: z.string().min(32),
  REFRESH_EXPIRES_IN: z.string().regex(durationPattern).default('7d'),
  CORS_ORIGIN: z.string().url(),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  const message = parsedEnv.error.issues.map((issue) => `${issue.path.join('.') || 'env'}: ${issue.message}`).join('; ');
  throw new Error(`Config validation error: ${message}`);
}

const accessSecret = parsedEnv.data.JWT_ACCESS_SECRET || parsedEnv.data.JWT_SECRET;

if (!accessSecret) {
  throw new Error('Config validation error: JWT_ACCESS_SECRET or JWT_SECRET is required');
}

export default {
  ...parsedEnv.data,
  JWT_ACCESS_SECRET: accessSecret,
  JWT_SECRET: parsedEnv.data.JWT_SECRET || accessSecret,
};
