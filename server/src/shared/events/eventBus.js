// server/src/shared/events/eventBus.js
import logger from '../utils/logger.js';

class EventBus {
  constructor() {
    this.handlers = new Map();
  }

  on(event, handler) {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event).add(handler);
  }

  off(event, handler) {
    if (this.handlers.has(event)) {
      this.handlers.get(event).delete(handler);
    }
  }

  emit(event, payload) {
    if (this.handlers.has(event)) {
      this.handlers.get(event).forEach((handler) => {
        try {
          handler(payload);
        } catch (error) {
          logger.error(`Error in event handler for ${event}:`, { error: error.message, stack: error.stack });
        }
      });
    }
  }

  once(event, handler) {
    const onceHandler = (payload) => {
      handler(payload);
      this.off(event, onceHandler);
    };
    this.on(event, onceHandler);
  }
}

export const eventBus = new EventBus();