import mongoose from 'mongoose';
import User from '../src/modules/auth/auth.model.js';
import * as authService from '../src/modules/auth/auth.service.js';

mongoose.connect('mongodb+srv://bharathkc05:dRFE6kvJBExPFnp8@cluster0.zp1lt.mongodb.net/?appName=Cluster0')
.then(async () => {
  const email = `test_restore_${Date.now()}@example.com`;
  
  console.log(`1. Signing up first time with ${email}...`);
  await authService.createUser({ name: 'First Name', email, password: 'Password123!' });
  
  const user = await User.findOne({ email });
  console.log(`   User created with ID: ${user._id}`);
  
  console.log('2. Soft-deleting the user...');
  user.isDeleted = true;
  user.deletedAt = new Date();
  await user.save();
  console.log('   User soft-deleted.');
  
  console.log('3. Trying to sign up again with same email...');
  const result = await authService.createUser({ name: 'New Restored Name', email, password: 'NewPassword123!' });
  
  const restoredUser = await User.findById(result.user.id);
  console.log(`   Success! Result Name: ${result.user.name}`);
  console.log(`   DB User isDeleted: ${restoredUser.isDeleted}`);
  console.log(`   DB User name: ${restoredUser.name}`);
  
  process.exit(0);
})
.catch(err => {
  console.error(err);
  process.exit(1);
});
