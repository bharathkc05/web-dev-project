import mongoose from 'mongoose';
import config from '../src/config/env.js';
import { Category } from '../src/shared/models/category.model.js';
import { QuickTab } from '../src/shared/models/quickTab.model.js';
import { Banner } from '../src/shared/models/banner.model.js';
import { MasterProduct } from '../src/shared/models/masterProduct.model.js';
import User from '../src/modules/auth/auth.model.js';

const seedCatalogue = async () => {
  try {
    await mongoose.connect(config.MONGODB_URI);
    console.log('Connected to MongoDB');

    const admin = await User.findOne({ email: 'admin@velvetbytes.com' });
    if (!admin) {
      throw new Error('Admin user not found. Please run the initial seed.js first.');
    }

    console.log('Clearing existing catalogue collections (to prevent duplicates)...');
    await Category.deleteMany({});
    await QuickTab.deleteMany({});
    await Banner.deleteMany({});
    await MasterProduct.deleteMany({});

    console.log('Seeding Categories...');
    const categoriesData = [
      { name: 'Burgers', description: 'Delicious handcrafted burgers', order: 1, isActive: true, createdBy: admin._id },
      { name: 'Beverages', description: 'Refreshing drinks and sodas', order: 2, isActive: true, createdBy: admin._id },
      { name: 'Sides', description: 'Crispy sides and fries', order: 3, isActive: true, createdBy: admin._id },
      { name: 'Desserts', description: 'Sweet treats to finish your meal', order: 4, isActive: true, createdBy: admin._id },
    ];
    const categories = await Category.insertMany(categoriesData);

    console.log('Seeding Quick Tabs...');
    const quickTabsData = [
      { name: 'Best Sellers', imageUrl: 'https://cdn-icons-png.flaticon.com/512/3132/3132693.png', order: 1, isActive: true, createdBy: admin._id },
      { name: 'New Arrivals', imageUrl: 'https://cdn-icons-png.flaticon.com/512/4112/4112117.png', order: 2, isActive: true, createdBy: admin._id },
      { name: 'Spicy', imageUrl: 'https://cdn-icons-png.flaticon.com/512/3224/3224097.png', order: 3, isActive: true, createdBy: admin._id },
    ];
    const quickTabs = await QuickTab.insertMany(quickTabsData);

    console.log('Seeding Banners...');
    const bannersData = [
      { title: 'Summer Special', imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', linkUrl: '/menu', order: 1, isActive: true, createdBy: admin._id },
      { title: 'Midnight Cravings', imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', linkUrl: '/menu', order: 2, isActive: true, createdBy: admin._id },
    ];
    await Banner.insertMany(bannersData);

    console.log('Seeding Master Products...');
    // Create products using the newly created ObjectIds
    const burgersCategory = categories.find(c => c.name === 'Burgers');
    const beveragesCategory = categories.find(c => c.name === 'Beverages');
    const bestSellersTab = quickTabs.find(t => t.name === 'Best Sellers');
    const spicyTab = quickTabs.find(t => t.name === 'Spicy');

    const productsData = [
      {
        name: "Classic Cheeseburger",
        description: "Juicy beef patty with melted cheddar, lettuce, and our secret sauce.",
        imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        category: burgersCategory._id,
        quickTab: bestSellersTab._id,
        isVeg: false,
        basePrice: 199,
        isActive: true,
        createdBy: admin._id
      },
      {
        name: "Spicy Paneer Crunch",
        description: "Crispy paneer patty topped with jalapenos and spicy mayo.",
        imageUrl: "https://images.unsplash.com/photo-1550547660-d9450f859349?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        category: burgersCategory._id,
        quickTab: spicyTab._id,
        isVeg: true,
        basePrice: 179,
        isActive: true,
        createdBy: admin._id
      },
      {
        name: "Berry Blast Cooler",
        description: "Refreshing mix of wild berries and sparkling water.",
        imageUrl: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
        category: beveragesCategory._id,
        isVeg: true,
        basePrice: 99,
        isActive: true,
        createdBy: admin._id
      }
    ];

    await MasterProduct.insertMany(productsData);

    console.log('Successfully seeded Catalogue!');
  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    await mongoose.connection.close();
  }
};

seedCatalogue();
