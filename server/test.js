import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import('./src/modules/products/product.model.js').then(async m => {
  await mongoose.connect(process.env.MONGODB_URI);
  const pipe = [
    { $match: { outletId: new mongoose.Types.ObjectId('6a4f4cfa7f62d1e63ce44e7d') } },
    { $lookup: { from: 'masterproducts', localField: 'masterProductId', foreignField: '_id', as: 'master' } },
    { $unwind: '$master' },
    { $match: { 'master.quickTab': 'BEVERAGES' } }
  ];
  const res = await m.Product.aggregate(pipe);
  console.log('Count:', res.length);
  process.exit(0);
});
