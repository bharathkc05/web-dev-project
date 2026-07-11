import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

import config from './config/env.js';
import logger from './shared/utils/logger.js';
import apiRouter from './routes/index.js';
import { errorHandler, notFoundHandler } from './shared/middleware/errorHandler.js';
import { apiLimiter } from './shared/middleware/rateLimiter.js';

const app = express();

// Set up security headers
app.use(helmet());

// Enable CORS
app.use(
  cors({
    origin: config.CORS_ORIGIN,
    credentials: true,
  })
);

// Compress responses
app.use(compression());

// Parse request body JSON (with explicit size limit)
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// Parse cookies
app.use(cookieParser());

// HTTP Request logging piped to Winston logger
const morganFormat = config.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(
  morgan(morganFormat, {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'UP',
    timestamp: new Date().toISOString(),
  });
});

// Mount global API Rate Limiter
app.use('/api', apiLimiter);

// Mount domain routes
app.use('/api', apiRouter);

// Handle 404 Route Not Found
app.use(notFoundHandler);

// Handle global Express errors
app.use(errorHandler);

export default app;
