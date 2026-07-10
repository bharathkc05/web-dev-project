import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

import Outlet from './src/shared/models/outlet.model.js';
import MasterProduct from './src/shared/models/masterProduct.model.js';
import { Product } from './src/modules/products/product.model.js';

async function migrate() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected.');

    // 1. Remove stock fields from existing products
    const updateResult = await Product.collection.updateMany(
      {},
      { $unset: { stock: "", lowStockThreshold: "" } }
    );
    console.log(`Unset stock fields in ${updateResult.modifiedCount} OutletProducts.`);

    // 2. Fetch required Outlets
    const targetOutlets = await Outlet.find({
      name: { $in: ['Mak Mall Mangalore', 'Velvet Bytes Main Outlet'] }
    });

    if (targetOutlets.length === 0) {
      console.log('Target outlets not found!');
      return;
    }

    console.log(`Found outlets: ${targetOutlets.map(o => o.name).join(', ')}`);

    // 3. Fetch all MasterProducts
    const masterProducts = await MasterProduct.find({});
    console.log(`Found ${masterProducts.length} MasterProducts.`);

    // 4. Seed missing products for both outlets
    let seededCount = 0;
    for (const outlet of targetOutlets) {
      console.log(`Processing outlet: ${outlet.name}`);
      for (const master of masterProducts) {
        // Check if product exists for this outlet
        const exists = await Product.findOne({ masterProductId: master._id, outletId: outlet._id });
        if (!exists) {
          await Product.create({
            masterProductId: master._id,
            outletId: outlet._id,
            price: master.basePrice,
            originalPrice: master.originalPrice,
            isAvailable: true
          });
          seededCount++;
        }
      }
    }

    console.log(`Successfully seeded ${seededCount} missing OutletProducts.`);
    console.log('Migration complete.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected.');
  }
}

migrate();
