import { kafkaClient } from './client.js';
import logger from '../utils/logger.js';

const producer = kafkaClient.producer();

let isConnected = false;

export const connectProducer = async () => {
  if (isConnected) return;
  try {
    await producer.connect();
    isConnected = true;
    logger.info('Kafka Producer connected');
  } catch (error) {
    logger.error('Failed to connect Kafka Producer', { error: error.message });
  }
};

export const disconnectProducer = async () => {
  if (!isConnected) return;
  try {
    await producer.disconnect();
    isConnected = false;
    logger.info('Kafka Producer disconnected');
  } catch (error) {
    logger.error('Failed to disconnect Kafka Producer', { error: error.message });
  }
};

/**
 * Publish an event to a specific Kafka topic.
 * 
 * @param {string} topic - e.g., 'orders.events', 'users.events'
 * @param {string} eventName - e.g., 'ORDER_CREATED', 'USER_SIGNUP'
 * @param {object} payload - The event data
 * @param {string} key - (Optional) Partition key, like orderId or userId, to ensure order
 */
export const publishEvent = async (topic, eventName, payload, key = null) => {
  try {
    if (!isConnected) {
      await connectProducer();
    }

    const message = {
      value: JSON.stringify({
        event: eventName,
        timestamp: new Date().toISOString(),
        data: payload,
      })
    };

    if (key) {
      message.key = String(key);
    }

    await producer.send({
      topic,
      messages: [message],
    });

    logger.debug(`Published event ${eventName} to topic ${topic}`, { key });
  } catch (error) {
    logger.error(`Failed to publish event ${eventName} to ${topic}`, { error: error.message, payload });
  }
};
