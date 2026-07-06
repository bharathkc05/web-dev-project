// server/src/shared/utils/socketManager.js
import logger from './logger.js';

let ioInstance = null;

/**
 * Initialize Socket.io instance globally
 * @param {Object} io - Socket.io server instance
 */
export const init = (io) => {
  ioInstance = io;
  logger.info('SocketManager initialized successfully');
};

/**
 * Emit an event to a Socket.io room
 * @param {string} room - Target room name
 * @param {string} event - Event name
 * @param {any} payload - Event payload data
 */
export const emitToRoom = (room, event, payload) => {
  if (!ioInstance) {
    logger.warn('SocketManager is not initialized yet. Skipping event broadcast.', { room, event });
    return;
  }

  try {
    ioInstance.to(room).emit(event, payload);
    logger.debug(`Socket event emitted: room=${room}, event=${event}`);
  } catch (error) {
    logger.error('Failed to emit Socket event', { room, event, message: error.message });
  }
};

/**
 * Get Socket.io server instance
 * @returns {Object|null}
 */
export const getIo = () => ioInstance;

export default {
  init,
  emitToRoom,
  getIo,
};
