import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.join(__dirname, '.env') });

// Import models
import User from './src/modules/auth/auth.model.js';
import Outlet from './src/shared/models/outlet.model.js';
import MasterProduct from './src/shared/models/masterProduct.model.js';
import { Product } from './src/modules/products/product.model.js';
import { ROLES } from './src/shared/constants/roles.js';

async function importData() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in .env');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected.');

    // 1. Get or Create Admin User
    let admin = await User.findOne({ role: ROLES.ADMIN });
    if (!admin) {
      admin = await User.create({
        name: 'System Admin',
        email: 'admin@velvetbytes.com',
        passwordHash: 'placeholder',
        role: ROLES.ADMIN,
      });
      console.log('Created Admin user.');
    } else {
      console.log('Admin user found.');
    }

    // 2. Get or Create Default Outlet
    let outlet = await Outlet.findOne({ name: 'Velvet Bytes Main Outlet' });
    if (!outlet) {
      outlet = await Outlet.create({
        name: 'Velvet Bytes Main Outlet',
        ownerId: admin._id,
        isApproved: true,
        isActive: true,
      });
      console.log('Created Default Outlet.');
    } else {
      console.log('Default Outlet found.');
    }

    // 3. Read products.html
    const productsPath = path.join(__dirname, 'products.html');
    const rawData = fs.readFileSync(productsPath, 'utf8');
    const products = JSON.parse(rawData);
    console.log(`Parsed ${products.length} products from products.html.`);

    // 4. Import products
    let count = 0;
    for (const item of products) {
      console.log(`Processing ${count + 1}/${products.length}: ${item.name}`);
      // Validate/normalize enums
      const category = item.category ? item.category.toUpperCase() : 'BURGERS';
      const quickTab = item.quickTab ? item.quickTab.toUpperCase() : 'CRAZY DEALS';
      
      // Update or create MasterProduct
      console.log('Finding masterProduct');
      let masterProduct = await MasterProduct.findOne({ name: item.name });
      if (!masterProduct) {
        console.log('Creating masterProduct');
        masterProduct = await MasterProduct.create({
          name: item.name,
          description: item.description || '',
          imageUrl: item.imageUrl || '',
          category,
          quickTab,
          isVeg: item.isVeg || false,
          basePrice: item.basePrice || 100,
          originalPrice: item.originalPrice || item.basePrice || 100,
          createdBy: admin._id,
        });
        console.log('Created masterProduct');
      } else {
        console.log('Updating masterProduct');
        masterProduct.description = item.description || masterProduct.description;
        masterProduct.imageUrl = item.imageUrl || masterProduct.imageUrl;
        masterProduct.category = category;
        masterProduct.quickTab = quickTab;
        masterProduct.isVeg = item.isVeg !== undefined ? item.isVeg : masterProduct.isVeg;
        masterProduct.basePrice = item.basePrice || masterProduct.basePrice;
        masterProduct.originalPrice = item.originalPrice || masterProduct.originalPrice;
        await masterProduct.save();
        console.log('Updated masterProduct');
      }

      console.log('Finding outletProduct');
      let outletProduct = await Product.findOne({
        masterProductId: masterProduct._id,
        outletId: outlet._id,
      });

      if (!outletProduct) {
        console.log('Creating outletProduct');
        await Product.create({
          masterProductId: masterProduct._id,
          outletId: outlet._id,
          price: masterProduct.basePrice,
          originalPrice: masterProduct.originalPrice,
          stock: 100, // Default stock
        });
        console.log('Created outletProduct');
      } else {
        console.log('Updating outletProduct');
        outletProduct.price = masterProduct.basePrice;
        outletProduct.originalPrice = masterProduct.originalPrice;
        await outletProduct.save();
        console.log('Updated outletProduct');
      }

      count++;
      console.log(`Finished ${item.name}`);
    }

    console.log(`Successfully imported/updated ${count} products into MongoDB!`);
    
  } catch (error) {
    console.error('Error importing data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected.');
  }
}

importData();
