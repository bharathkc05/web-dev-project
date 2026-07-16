import { kafkaClient } from './client.js';
import logger from '../utils/logger.js';

// All instances in this consumer group will share the load
const consumer = kafkaClient.consumer({ groupId: 'ecom-api-group-1' });

let isConnected = false;

// Simple registry for event handlers
const handlers = new Map();

/**
 * Register a handler for a specific event
 * @param {string} eventName - e.g. 'ORDER_CREATED'
 * @param {function} handler - function to execute
 */
export const registerKafkaHandler = (eventName, handler) => {
  if (!handlers.has(eventName)) {
    handlers.set(eventName, []);
  }
  handlers.get(eventName).push(handler);
};

export const startConsumer = async () => {
  if (isConnected) return;
  try {
    await consumer.connect();
    isConnected = true;
    logger.info('Kafka Consumer connected');

    // Auto-create topics if they don't exist
    const admin = kafkaClient.admin();
    await admin.connect();
    const existingTopics = await admin.listTopics();
    const requiredTopics = ['orders.events', 'users.events'];
    const topicsToCreate = requiredTopics.filter(topic => !existingTopics.includes(topic));
    
    if (topicsToCreate.length > 0) {
      await admin.createTopics({
        topics: topicsToCreate.map(topic => ({ topic, numPartitions: 1 }))
      });
      logger.info(`Created Kafka topics: ${topicsToCreate.join(', ')}`);
    }
    await admin.disconnect();

    // Subscribe to topics
    await consumer.subscribe({ topic: 'orders.events', fromBeginning: false });
    await consumer.subscribe({ topic: 'users.events', fromBeginning: false });

    // Start consuming
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const payload = JSON.parse(message.value.toString());
          const { event, data } = payload;
          
          logger.debug(`Consumed event ${event} from topic ${topic}`);

          // Trigger local handlers
          const eventHandlers = handlers.get(event);
          if (eventHandlers && eventHandlers.length > 0) {
            for (const handler of eventHandlers) {
              await handler(data);
            }
          }
        } catch (error) {
          logger.error('Error processing Kafka message', { error: error.message, topic, partition });
        }
      },
    });

  } catch (error) {
    logger.error('Failed to start Kafka Consumer', { error: error.message });
  }
};

export const stopConsumer = async () => {
  if (!isConnected) return;
  try {
    await consumer.disconnect();
    isConnected = false;
    logger.info('Kafka Consumer disconnected');
  } catch (error) {
    logger.error('Failed to disconnect Kafka Consumer', { error: error.message });
  }
};
