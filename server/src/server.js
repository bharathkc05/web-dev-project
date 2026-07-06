import app from './app.js';
import config from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';
import { connectRedis, disconnectRedis } from './shared/utils/redis.js';
import { initOrderWorker } from './modules/orders/order.worker.js';
import logger from './shared/utils/logger.js';

let server;

const startServer = async () => {
  try {
    logger.info('Starting Velvet Bytes Server...');

    // Connect to MongoDB
    await connectDB();

    // Connect to Redis
    await connectRedis();

    // Initialize BullMQ workers
    await initOrderWorker();

    // Start listening
    server = app.listen(config.PORT, () => {
      logger.info(`Server successfully started on port ${config.PORT} in ${config.NODE_ENV} mode`);
    });

    // Handle unhandled promise rejections outside route context
    process.on('unhandledRejection', (err) => {
      logger.error('UNHANDLED REJECTION! Shutting down gracefully...', {
        message: err.message,
        stack: err.stack,
      });
      shutdown(1);
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (err) => {
      logger.error('UNCAUGHT EXCEPTION! Shutting down gracefully...', {
        message: err.message,
        stack: err.stack,
      });
      shutdown(1);
    });

  } catch (error) {
    logger.error('Failed to start server', {
      message: error.message,
      stack: error.stack,
    });
    process.exit(1);
  }
};

const shutdown = async (code = 0) => {
  logger.info('Received shutdown signal. Commencing graceful shutdown...');

  // 1. Close HTTP server so we do not accept new requests
  if (server) {
    server.close(() => {
      logger.info('HTTP server closed successfully');
    });
  }

  try {
    // 2. Disconnect from Redis client
    await disconnectRedis();
    logger.info('Redis client disconnected successfully');

    // 3. Disconnect from MongoDB Mongoose connection
    await disconnectDB();
    logger.info('MongoDB connection disconnected successfully');

    logger.info('Graceful shutdown completed successfully. Goodbye.');
    process.exit(code);
  } catch (error) {
    logger.error('Error during shutdown', {
      message: error.message,
      stack: error.stack,
    });
    process.exit(1);
  }
};

// Listen for process termination signals
process.on('SIGTERM', () => shutdown(0));
process.on('SIGINT', () => shutdown(0));

// Invoke server startup
startServer();
