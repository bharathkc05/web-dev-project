import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import jwt from 'jsonwebtoken';

import app from './app.js';
import config from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';
import { connectRedis, disconnectRedis } from './shared/utils/redis.js';
import { initOrderWorker } from './modules/orders/order.worker.js';
import { init as initSocketManager } from './shared/utils/socketManager.js';
import { connectProducer, disconnectProducer } from './shared/kafka/producer.js';
import { startConsumer, stopConsumer } from './shared/kafka/consumer.js';
import logger from './shared/utils/logger.js';

let server;
let io;

const startServer = async () => {
  try {
    logger.info('Starting Velvet Bytes Server...');

    // Connect to MongoDB
    await connectDB();

    // Connect to Redis
    await connectRedis();

    // Initialize BullMQ workers
    await initOrderWorker();

    // Initialize Kafka
    await connectProducer();
    await startConsumer();

    // Create HTTP server from Express app
    server = http.createServer(app);

    // -------------------------------------------------------
    // Fix #11: Socket.io with server-side JWT authentication
    // -------------------------------------------------------
    io = new SocketIOServer(server, {
      cors: {
        origin: config.CORS_ORIGIN,
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    // JWT authentication middleware for every socket connection
    io.use((socket, next) => {
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }
      try {
        const decoded = jwt.verify(token, config.JWT_ACCESS_SECRET);
        socket.user = decoded; // { sub: userId, role }
        next();
      } catch (err) {
        logger.warn('Socket authentication failed', { message: err.message });
        next(new Error('Authentication error: Invalid or expired token'));
      }
    });

    // Handle socket connections — enforce room access by role
    io.on('connection', (socket) => {
      const userId = socket.user?.sub;
      const role = socket.user?.role;
      logger.debug(`Socket connected: userId=${userId}, role=${role}`);

      socket.on('joinRoom', (room) => {
        // Validate the room the client is requesting to join
        const isAllowed = (() => {
          if (role === 'ADMIN') return true; // Admin can join any room
          if (role === 'OUTLET_MANAGER' && room.startsWith('outlet_')) return true;
          if (role === 'CUSTOMER' && room === `user_${userId}`) return true;
          return false;
        })();

        if (!isAllowed) {
          logger.warn(`Socket room join denied: userId=${userId}, role=${role}, room=${room}`);
          socket.emit('error', { message: 'Access denied to room' });
          return;
        }

        socket.join(room);
        logger.debug(`Socket joined room: userId=${userId}, room=${room}`);
      });

      socket.on('disconnect', () => {
        logger.debug(`Socket disconnected: userId=${userId}`);
      });
    });

    // Initialize the global socket manager
    initSocketManager(io);

    // Start listening
    server.listen(config.PORT, () => {
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

    await disconnectProducer();
    await stopConsumer();

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
