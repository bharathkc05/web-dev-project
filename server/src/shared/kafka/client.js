import { Kafka } from 'kafkajs';
import logger from '../utils/logger.js';
import config from '../../config/env.js';

// We can define kafka broker in env.js later, default to localhost for now
const brokers = config.KAFKA_BROKERS ? config.KAFKA_BROKERS.split(',') : ['localhost:9092'];

export const kafkaClient = new Kafka({
  clientId: 'ecom-api',
  brokers,
  logCreator: (logLevel) => {
    return ({ namespace, level, label, log }) => {
      const { message, ...extra } = log;
      logger.debug(`Kafka [${namespace}]: ${message}`, extra);
    };
  }
});

export const connectKafka = async () => {
  try {
    // Optional: We can connect the admin client here to check status
    const admin = kafkaClient.admin();
    await admin.connect();
    logger.info('Kafka Admin connected successfully (Brokers reachable)');
    await admin.disconnect();
  } catch (error) {
    logger.error('Failed to connect to Kafka Brokers:', error);
  }
};
