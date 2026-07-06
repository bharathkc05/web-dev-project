// server/src/config/db.js
import mongoose from 'mongoose';

import config from './env.js';
import logger from '../shared/utils/logger.js';

let isConnected = false;
let hasRegisteredListeners = false;

const registerConnectionListeners = () => {
  if (hasRegisteredListeners) {
    return;
  }

  mongoose.connection.on('error', (error) => {
    isConnected = false;
    logger.error('MongoDB connection error', { message: error.message, stack: error.stack });
  });

  mongoose.connection.on('disconnected', () => {
    isConnected = false;
    logger.warn('MongoDB disconnected');
  });

  process.on('SIGINT', async () => {
    await disconnectDB();
    logger.info('MongoDB connection closed due to app termination');
    process.exit(0);
  });

  hasRegisteredListeners = true;
};

export const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) {
    logger.warn('MongoDB already connected');
    return mongoose.connection;
  }

  try {
    const conn = await mongoose.connect(config.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    isConnected = true;
    registerConnectionListeners();
    logger.info(`MongoDB connected: ${conn.connection.host}`);

    return conn;
  } catch (error) {
    isConnected = false;
    logger.error('MongoDB connection failed', { message: error.message, stack: error.stack });
    throw error;
  }
};

export const disconnectDB = async () => {
  if (!isConnected && mongoose.connection.readyState !== 1) {
    return;
  }

  await mongoose.connection.close();
  isConnected = false;
};