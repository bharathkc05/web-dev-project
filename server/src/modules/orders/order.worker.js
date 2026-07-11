// server/src/modules/orders/order.worker.js
import { Queue, Worker } from 'bullmq';
import { getRedisClient } from '../../shared/utils/redis.js';
import { sendEmail } from '../../shared/utils/email.js';
import { Order } from '../orders/order.model.js';
import User from '../auth/auth.model.js';
import logger from '../../shared/utils/logger.js';

import { QUEUES } from '../../shared/events/queueNames.js';

const QUEUE_NAME = QUEUES.ORDER_CONFIRMATION;
let queueInstance = null;
let workerInstance = null;

/**
 * Lazy load BullMQ Queue instance
 */
export const getQueue = async () => {
  if (queueInstance) return queueInstance;
  const redisClient = await getRedisClient();
  
  queueInstance = new Queue(QUEUE_NAME, {
    connection: redisClient,
  });
  return queueInstance;
};

/**
 * Add a job to the BullMQ Order jobs queue
 * @param {string} orderId - System internal Order ID
 * @param {string} jobType - Type of job to execute (e.g. ORDER_CONFIRMED)
 * @param {Object} data - Additional metadata payload
 */
export const pushBullMQJob = async (orderId, jobType, data = {}) => {
  try {
    const q = await getQueue();
    await q.add(jobType, { orderId, ...data });
    logger.info(`Pushed BullMQ job to queue: type=${jobType}, orderId=${orderId}`);
  } catch (error) {
    logger.error('Failed to push BullMQ job to queue', { orderId, jobType, error: error.message });
  }
};

/**
 * Initialize BullMQ Worker listener process
 */
export const initOrderWorker = async () => {
  if (workerInstance) return;
  const redisClient = await getRedisClient();

  workerInstance = new Worker(
    QUEUE_NAME,
    async (job) => {
      const { orderId } = job.data;
      logger.info(`Processing order background job: id=${job.id}, name=${job.name}, orderId=${orderId}`);

      if (job.name === 'ORDER_CONFIRMED') {
        const order = await Order.findById(orderId);
        if (!order) {
          logger.warn(`Job skipped: Order ${orderId} not found in database`);
          return;
        }

        const user = await User.findById(order.userId);
        if (!user || !user.email) {
          logger.warn(`Job skipped: User or email not found for ID ${order.userId}`);
          return;
        }

        // Generate email html template
        const html = `
          <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #6a1b9a;">Order Confirmed!</h2>
            <p>Hi <strong>${user.name}</strong>,</p>
            <p>We have successfully received your payment / order placement for order #<strong>${order._id}</strong>.</p>
            <hr style="border: none; border-top: 1px solid #eee;" />
            <p><strong>Total Amount:</strong> $${order.totalAmount}</p>
            <p><strong>Payment Mode:</strong> ${order.paymentMode}</p>
            <p><strong>Delivery Address:</strong> ${order.address.street}, ${order.address.city}, ${order.address.state} - ${order.address.pincode}</p>
            <hr style="border: none; border-top: 1px solid #eee;" />
            <p>Your items are now being prepared at the outlet. We will notify you when your order status updates.</p>
            <p>Thank you for choosing Velvet Bytes!</p>
          </div>
        `;

        await sendEmail({
          to: user.email,
          subject: 'Your order has been confirmed! - Velvet Bytes',
          html,
        });
      }
    },
    { connection: redisClient }
  );

  workerInstance.on('completed', (job) => {
    logger.info(`BullMQ order job completed: id=${job.id}, name=${job.name}`);
  });

  workerInstance.on('failed', (job, error) => {
    logger.error('BullMQ order job execution failed', { jobId: job?.id, name: job?.name, error: error.message });
  });

  logger.info('BullMQ Order Worker initialized successfully');
};

export default {
  pushBullMQJob,
  initOrderWorker,
};
