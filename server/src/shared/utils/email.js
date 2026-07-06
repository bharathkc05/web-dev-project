// server/src/shared/utils/email.js
import nodemailer from 'nodemailer';
import logger from './logger.js';

// Setup email transporter with Gmail SMTP configs
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for 587
  auth: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '',
  },
});

/**
 * Send HTML emails via Gmail SMTP transporter.
 * @param {Object} options - { to, subject, html }
 */
export const sendEmail = async ({ to, subject, html }) => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    logger.warn('SMTP Credentials (EMAIL_USER/EMAIL_PASS) missing. Mocking email delivery:', {
      to,
      subject,
    });
    return { messageId: 'mock-message-id' };
  }

  try {
    const info = await transporter.sendMail({
      from: `"Velvet Bytes" <${emailUser}>`,
      to,
      subject,
      html,
    });

    logger.info(`Email sent successfully to ${to}, messageId=${info.messageId}`);
    return info;
  } catch (error) {
    logger.error('Email delivery failed', { to, subject, message: error.message });
    throw error;
  }
};

export default {
  sendEmail,
};
