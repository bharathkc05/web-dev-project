import 'dotenv/config';
import Razorpay from 'razorpay';
import crypto from 'crypto';

const runTest = async () => {
  try {
    console.log('Testing Razorpay Credentials...');
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    console.log(`Using Key ID: ${process.env.RAZORPAY_KEY_ID}`);

    const options = {
      amount: 50000, // 500 INR
      currency: 'INR',
      receipt: 'test_receipt_123',
    };

    console.log('Creating order with Razorpay...');
    const order = await instance.orders.create(options);
    console.log('✅ SUCCESS! Order created:');
    console.log(order);

  } catch (error) {
    console.error('❌ ERROR:', error);
  }
};

runTest();
