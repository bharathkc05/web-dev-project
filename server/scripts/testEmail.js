import dotenv from 'dotenv';
dotenv.config();

import { sendEmail } from '../src/shared/utils/email.js';

console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '********' : 'NOT SET');

async function testEmail() {
  try {
    const info = await sendEmail({
      to: process.env.EMAIL_USER || 'test@example.com',
      subject: 'Test Email from Velvet Bytes',
      html: '<h1>This is a test email</h1><p>If you received this, SMTP is working!</p>'
    });
    console.log('SUCCESS:', info);
  } catch (err) {
    console.error('ERROR:', err);
  }
  process.exit(0);
}

testEmail();
