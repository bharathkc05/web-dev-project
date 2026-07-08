import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load env
dotenv.config({ path: path.resolve('c:/Users/Acer/Desktop/EComSite/server/.env') });

const masterProductSchema = new mongoose.Schema({}, { strict: false });
const productSchema = new mongoose.Schema({}, { strict: false });

const MasterProduct = mongoose.model('MasterProduct', masterProductSchema);
const Product = mongoose.model('Product', productSchema);

const categoryMap = {
  'BURGER': 'BURGERS',
  'SIDE': 'SNACKS',
  'BEVERAGE': 'BEVERAGES',
  'DESSERT': 'DESSERTS',
  'PERI PERI FEST': 'BURGERS'
};

const quickTabMap = {
  'PERI PERI FEST': 'PERI PERI FEST'
};

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const products = await MasterProduct.find({});
    console.log(`Found ${products.length} master products.`);

    let updated = 0;
    for (const p of products) {
      const oldCat = p.get('category');
      const updates = {};
      
      if (categoryMap[oldCat]) {
        updates.category = categoryMap[oldCat];
      } else if (['BURGERS', 'WRAPS', 'SNACKS', 'BEVERAGES', 'DESSERTS', 'BK CAFE', 'MEALS'].includes(oldCat)) {
        // Already migrated
      } else {
        updates.category = 'SNACKS'; // fallback
      }

      if (quickTabMap[oldCat]) {
        updates.quickTab = quickTabMap[oldCat];
      }

      if (Object.keys(updates).length > 0) {
        await MasterProduct.updateOne({ _id: p._id }, { $set: updates });
        updated++;
      }
    }
    
    console.log(`Migrated ${updated} master products.`);
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from DB');
  }
}

migrate();
