import mongoose from 'mongoose';
import User from '../src/modules/auth/auth.model.js';

mongoose.connect('mongodb+srv://bharathkc05:dRFE6kvJBExPFnp8@cluster0.zp1lt.mongodb.net/?appName=Cluster0')
.then(async () => {
  const users = await User.find({}).select('email isActive isDeleted');
  console.log('Registered Users:');
  console.table(users.map(u => ({ email: u.email, isActive: u.isActive, isDeleted: u.isDeleted })));
  process.exit(0);
})
.catch(err => {
  console.error(err);
  process.exit(1);
});
