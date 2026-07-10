import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import config from '../src/config/env.js';
import { Category } from '../src/shared/models/category.model.js';
import { QuickTab } from '../src/shared/models/quickTab.model.js';
import { MasterProduct } from '../src/shared/models/masterProduct.model.js';
import User from '../src/modules/auth/auth.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const importProducts = async () => {
  try {
    await mongoose.connect(config.MONGODB_URI);
    console.log('Connected to MongoDB');

    const admin = await User.findOne({ email: 'admin@velvetbytes.com' });
    if (!admin) {
      throw new Error('Admin user not found. Cannot set createdBy.');
    }

    const productsFile = path.join(__dirname, '../products.html');
    const productsData = JSON.parse(fs.readFileSync(productsFile, 'utf8'));
    console.log(`Loaded ${productsData.length} products from products.html`);

    // Extract unique categories and quickTabs
    const uniqueCategories = [...new Set(productsData.map(p => p.category).filter(Boolean))];
    const uniqueQuickTabs = [...new Set(productsData.map(p => p.quickTab).filter(Boolean))];

    // Find or create Categories
    const categoryMap = {}; // { string: ObjectId }
    for (const catName of uniqueCategories) {
      let category = await Category.findOne({ name: catName });
      if (!category) {
        category = await Category.create({
          name: catName,
          isActive: true,
          createdBy: admin._id
        });
        console.log(`Created new category: ${catName}`);
      }
      categoryMap[catName] = category._id;
    }

    // Find or create QuickTabs
    const quickTabMap = {};
    for (const tabName of uniqueQuickTabs) {
      let quickTab = await QuickTab.findOne({ name: tabName });
      if (!quickTab) {
        quickTab = await QuickTab.create({
          name: tabName,
          isActive: true,
          createdBy: admin._id
        });
        console.log(`Created new quick tab: ${tabName}`);
      }
      quickTabMap[tabName] = quickTab._id;
    }

    // Process and insert products
    let addedCount = 0;
    for (const product of productsData) {
      const exists = await MasterProduct.findOne({ name: product.name });
      if (exists) {
        console.log(`Product ${product.name} already exists, skipping.`);
        continue;
      }

      const newProductData = {
        name: product.name,
        description: product.description,
        imageUrl: product.imageUrl,
        isVeg: product.isVeg,
        basePrice: product.basePrice,
        originalPrice: product.originalPrice,
        isActive: true,
        createdBy: admin._id
      };

      if (product.category && categoryMap[product.category]) {
        newProductData.category = categoryMap[product.category];
      }
      
      if (product.quickTab && quickTabMap[product.quickTab]) {
        newProductData.quickTab = quickTabMap[product.quickTab];
      }

      await MasterProduct.create(newProductData);
      addedCount++;
    }

    console.log(`Successfully imported ${addedCount} products!`);
  } catch (error) {
    console.error('Import failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
};

importProducts();
