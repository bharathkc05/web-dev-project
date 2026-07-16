// server/tests/setup/jest.setup.js
import { jest } from '@jest/globals';

// Set environment to test globally
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_1234567890123456';
process.env.JWT_ACCESS_SECRET = 'test_jwt_secret_1234567890123456';
process.env.REFRESH_SECRET = 'test_refresh_secret_1234567890123456';
process.env.JWT_EXPIRES_IN = '15m';
process.env.REFRESH_EXPIRES_IN = '7d';

// Suppress Winston logger output during tests
jest.unstable_mockModule('../../src/shared/utils/logger.js', () => ({
  default: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    add: jest.fn(),
  }
}));

// Mock Kafka Producer & Consumer
jest.unstable_mockModule('../../src/shared/kafka/producer.js', () => ({
  connectProducer: jest.fn().mockResolvedValue(),
  disconnectProducer: jest.fn().mockResolvedValue(),
  publishEvent: jest.fn().mockResolvedValue(),
}));

jest.unstable_mockModule('../../src/shared/kafka/consumer.js', () => ({
  startConsumer: jest.fn().mockResolvedValue(),
  stopConsumer: jest.fn().mockResolvedValue(),
  registerKafkaHandler: jest.fn(),
}));
