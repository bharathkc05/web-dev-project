import mongoose from 'mongoose';
import { Product } from '../src/modules/products/product.model.js';

mongoose.connect('mongodb+srv://bharathkc05:dRFE6kvJBExPFnp8@cluster0.zp1lt.mongodb.net/?appName=Cluster0')
.then(async () => {
  const tabId = '6a4f77b310cefff1d0be8d7b'; 
  
  const pipeline = [
    {
      $lookup: {
        from: 'masterproducts',
        localField: 'masterProductId',
        foreignField: '_id',
        as: 'master',
      }
    },
    { $unwind: '$master' },
    { $match: { 'master.quickTab': new mongoose.Types.ObjectId(tabId) } }
  ];
  
  const results = await Product.aggregate(pipeline);
  console.log(`Pipeline matched ${results.length} products for tabId ${tabId}`);
  if(results.length > 0) {
    console.log('Sample quickTab:', results[0].master.quickTab);
  }
  process.exit(0);
});
