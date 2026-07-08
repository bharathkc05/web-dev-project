import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

import User from '../src/modules/auth/auth.model.js';
import Outlet from '../src/shared/models/outlet.model.js';
import { ROLES } from '../src/shared/constants/roles.js';

const seedDatabase = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected.');

    // Clear existing dummy data if necessary, or just create if they don't exist
    // Using simple find/create to avoid wiping out everything

    const passwordHash = await bcrypt.hash('password123', 10);

    // 1. Create Admin
    let admin = await User.findOne({ email: 'admin@velvetbytes.com' });
    if (!admin) {
      admin = await User.create({
        name: 'System Admin',
        email: 'admin@velvetbytes.com',
        passwordHash,
        role: ROLES.ADMIN,
      });
      console.log('Admin account created: admin@velvetbytes.com / password123');
    } else {
      console.log('Admin account already exists.');
    }

    // 2. Create Outlet
    let outlet = await Outlet.findOne({ name: 'Mak Mall Mangalore' });
    if (!outlet) {
      outlet = await Outlet.create({
        name: 'Mak Mall Mangalore',
        isApproved: true,
        isActive: true,
      });
      console.log('Outlet created: Mak Mall Mangalore');
    } else {
      console.log('Outlet already exists.');
    }

    // 3. Create Outlet Manager
    let manager = await User.findOne({ email: 'manager@velvetbytes.com' });
    if (!manager) {
      manager = await User.create({
        name: 'Outlet Manager',
        email: 'manager@velvetbytes.com',
        passwordHash,
        role: ROLES.OUTLET_MANAGER,
        outletId: outlet._id,
      });
      console.log('Outlet Manager account created: manager@velvetbytes.com / password123');
      
      // Assign ownerId to outlet
      outlet.ownerId = manager._id;
      await outlet.save();
    } else {
      console.log('Outlet Manager account already exists.');
    }

    // 4. Create Customer
    let customer = await User.findOne({ email: 'customer@velvetbytes.com' });
    if (!customer) {
      customer = await User.create({
        name: 'John Doe',
        email: 'customer@velvetbytes.com',
        passwordHash,
        role: ROLES.CUSTOMER,
      });
      console.log('Customer account created: customer@velvetbytes.com / password123');
    } else {
      console.log('Customer account already exists.');
    }

    // 5. Drop old Products collection
    try {
      await mongoose.connection.db.dropCollection('products');
      console.log('Dropped old products collection.');
    } catch (e) {
      if (e.code === 26) {
        console.log('Old products collection does not exist.');
      } else {
        console.log('Error dropping old products collection:', e.message);
      }
    }

    // 6. Seed Master Products
    const { MasterProduct } = await import('../src/shared/models/masterProduct.model.js');
    
    const masterProductsCount = await MasterProduct.countDocuments();
    if (masterProductsCount === 0) {
      const sampleMasterProducts = [
        {
          name: 'Classic Chicken Burger',
          description: 'Crispy fried chicken patty with lettuce and mayo',
          category: 'BURGER',
          isVeg: false,
          basePrice: 120,
          isActive: true,
          createdBy: admin._id,
        },
        {
          name: 'Spicy Veggie Delight',
          description: 'Mixed vegetable patty with spicy sauce',
          category: 'BURGER',
          isVeg: true,
          basePrice: 90,
          isActive: true,
          createdBy: admin._id,
        },
        {
          name: 'French Fries',
          description: 'Crispy golden potato fries',
          category: 'SIDE',
          isVeg: true,
          basePrice: 60,
          isActive: true,
          createdBy: admin._id,
        },
        {
          name: 'Cold Coffee',
          description: 'Refreshing cold coffee with ice cream',
          category: 'BEVERAGE',
          isVeg: true,
          basePrice: 80,
          isActive: true,
          createdBy: admin._id,
        }
      ];
      await MasterProduct.insertMany(sampleMasterProducts);
      console.log('Seeded Master Products.');
    } else {
      console.log('Master products already seeded.');
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
