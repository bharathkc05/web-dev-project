// server/src/modules/orders/order.worker.js
import { Queue, Worker } from 'bullmq';
import Redis from 'ioredis';
import config from '../../config/env.js';
import { sendEmail } from '../../shared/utils/email.js';
import { Order } from '../orders/order.model.js';
import User from '../auth/auth.model.js';
import logger from '../../shared/utils/logger.js';

import { QUEUES } from '../../shared/events/queueNames.js';

const QUEUE_NAME = QUEUES.ORDER_CONFIRMATION;
let queueInstance = null;
let workerInstance = null;

// BullMQ specifically requires ioredis
const bullmqRedisConnection = new Redis(config.REDIS_URL, {
  maxRetriesPerRequest: null,
});

/**
 * Lazy load BullMQ Queue instance
 */
export const getQueue = async () => {
  if (queueInstance) return queueInstance;
  
  queueInstance = new Queue(QUEUE_NAME, {
    connection: bullmqRedisConnection,
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
          <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); border: 1px solid #f0f0f0;">
            <div style="background-color: #703b29; padding: 40px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase;">Velvet Bytes</h1>
            </div>
            
            <div style="padding: 40px 30px; background-color: #ffffff;">
              <div style="text-align: center; margin-bottom: 30px;">
                <div style="background-color: #f6fdf6; color: #2e7d32; display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: bold; font-size: 14px; letter-spacing: 1px; border: 1px solid #c8e6c9;">
                  ✓ ORDER CONFIRMED
                </div>
              </div>
              
              <h2 style="color: #333333; font-size: 22px; font-weight: 700; margin-top: 0; margin-bottom: 20px; text-align: center;">Thank You, ${user.name}!</h2>
              
              <p style="color: #555555; font-size: 16px; line-height: 1.6; margin-bottom: 30px; text-align: center;">
                We've successfully received your order. Your delicious items are now being prepared with care at our outlet!
              </p>
              
              <div style="background-color: #fcfcfc; border: 1px solid #eeeeee; border-radius: 8px; padding: 25px; margin-bottom: 30px;">
                <h3 style="margin-top: 0; color: #703b29; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #eeeeee; padding-bottom: 10px; margin-bottom: 15px;">Order Details</h3>
                
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; color: #777777; font-size: 14px;">Order Number</td>
                    <td style="padding: 8px 0; color: #333333; font-size: 14px; font-weight: 600; text-align: right;">#${order._id.toString().slice(-8).toUpperCase()}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #777777; font-size: 14px;">Total Amount</td>
                    <td style="padding: 8px 0; color: #333333; font-size: 16px; font-weight: 800; text-align: right;">₹${order.totalAmount.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #777777; font-size: 14px;">Payment Mode</td>
                    <td style="padding: 8px 0; color: #333333; font-size: 14px; font-weight: 600; text-align: right;">${order.paymentMode}</td>
                  </tr>
                </table>
                
                <h3 style="margin-top: 25px; color: #703b29; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #eeeeee; padding-bottom: 10px; margin-bottom: 15px;">Delivery To</h3>
                <p style="margin: 0; color: #555555; font-size: 14px; line-height: 1.5;">
                  <strong>${order.address?.street || 'Store'}</strong><br>
                  ${order.address?.city || 'Takeaway/Dine-In'}${order.address?.state ? `, ${order.address.state}` : ''} ${order.address?.pincode ? `- ${order.address.pincode}` : ''}
                </p>
              </div>
              
              <div style="text-align: center; margin: 35px 0;">
                <a href="${config.CLIENT_URL || 'http://localhost:5173'}/account/orders" style="display: inline-block; padding: 14px 32px; background-color: #703b29; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase;">Track Your Order</a>
              </div>
            </div>
            
            <div style="background-color: #f9f9f9; padding: 25px 20px; text-align: center; border-top: 1px solid #eeeeee;">
              <p style="color: #777777; font-size: 13px; margin-bottom: 10px; margin-top: 0;">We'll notify you as soon as your order status updates.</p>
              <p style="color: #999999; font-size: 12px; margin: 0;">&copy; ${new Date().getFullYear()} Velvet Bytes. All rights reserved.</p>
            </div>
          </div>
        `;

        await sendEmail({
          to: user.email,
          subject: 'Your order has been confirmed! - Velvet Bytes',
          html,
        });
      }
    },
    { connection: bullmqRedisConnection }
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
