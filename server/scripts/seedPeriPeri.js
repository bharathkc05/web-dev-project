import mongoose from 'mongoose';
import config from '../src/config/env.js';
import { MasterProduct } from '../src/shared/models/masterProduct.model.js';
import User from '../src/modules/auth/auth.model.js';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary explicitly
cloudinary.config({
  cloudinary_url: config.CLOUDINARY_URL,
});

const uploadImageFromUrl = async (url) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(url, { folder: 'products' }, (error, result) => {
      if (error) return reject(error);
      resolve(result.secure_url);
    });
  });
};

const periPeriProducts = [
  {
    name: "Peri Peri Veg Whopper",
    description: "XL size 7 layer Veg Whopper with crunchy veg patty dunked in hot & spicy Peri Peri glaze with herby mayo in premium glazed buns for authentic Peri Peri flavours",
    imageUrl: "https://d1rgpf387mknul.cloudfront.net/products/PLP/web/2x_web_20260707074105650242_482x264jpg",
    category: "PERI PERI FEST",
    isVeg: true,
    basePrice: 299
  },
  {
    name: "Peri Peri Paneer Burger",
    description: "Crispy paneer patty dunked in hot & spicy Peri Peri glaze with herby mayo in premium brioche buns for authentic Peri Peri flavours",
    imageUrl: "https://d1rgpf387mknul.cloudfront.net/products/PLP/web/2x_web_20260707073736769764_482x264jpg",
    category: "PERI PERI FEST",
    isVeg: true,
    basePrice: 299
  },
  {
    name: "Peri Peri Chicken Burger",
    description: "Crispy Juicy whole-muscle chicken patty dunked in hot & spicy Peri Peri glaze with herby mayo in premium brioche bun for authentic Peri Peri flavours",
    imageUrl: "https://d1rgpf387mknul.cloudfront.net/products/PLP/web/2x_web_20260707072121575927_482x264jpg",
    category: "PERI PERI FEST",
    isVeg: false,
    basePrice: 299
  },
  {
    name: "Peri Peri Cheese Burger",
    description: "Molten Cheese Lava patty dunked in hot & spicy Peri Peri glaze with herby mayo in premium brioche buns for authentic Peri Peri flavours.",
    imageUrl: "https://d1rgpf387mknul.cloudfront.net/products/PLP/web/2x_web_20260707064817745873_482x264jpg",
    category: "PERI PERI FEST",
    isVeg: true,
    basePrice: 299
  },
  {
    name: "Peri Peri Fries (King)",
    description: "Crispy Fries with Tangy Peri Peri Spice",
    imageUrl: "https://d1rgpf387mknul.cloudfront.net/products/PLP/web/2x_web_20260707074525422686_482x264jpg",
    category: "PERI PERI FEST",
    isVeg: true,
    basePrice: 159
  },
  {
    name: "Peri Peri Chicken Boneless (4pc)",
    description: "Boneless chicken dunked in hot and spicy peri peri glaze",
    imageUrl: "https://d1rgpf387mknul.cloudfront.net/products/PLP/web/2x_web_20260707071245358965_482x264jpg",
    category: "PERI PERI FEST",
    isVeg: false,
    basePrice: 219
  },
  {
    name: "Peri Peri Chicken Boneless (7pc)",
    description: "Boneless chicken dunked in hot and spicy peri peri glaze",
    imageUrl: "https://d1rgpf387mknul.cloudfront.net/products/PLP/web/2x_web_20260707071402477885_482x264jpg",
    category: "PERI PERI FEST",
    isVeg: false,
    basePrice: 379
  },
  {
    name: "Peri Peri Chicken Nuggets (4pc)",
    description: "Tender Juicy Crunchy Chicken Nuggets fried to golden perfection topped with Peri Peri Glaze",
    imageUrl: "https://d1rgpf387mknul.cloudfront.net/products/PLP/web/2x_web_20260707072512155161_482x264jpg",
    category: "PERI PERI FEST",
    isVeg: false,
    basePrice: 149
  },
  {
    name: "Peri Peri Chicken Nuggets (6pc) with Dip",
    description: "Tender Juicy Crunchy Chicken Nuggets fried to golden perfection topped with Peri Peri Glaze and a dip of your choice",
    imageUrl: "https://d1rgpf387mknul.cloudfront.net/products/PLP/web/2x_web_20260707072655370360_482x264jpg",
    category: "PERI PERI FEST",
    isVeg: false,
    basePrice: 243
  },
  {
    name: "Peri Peri Chicken Wings (4pc)",
    description: "Chicken Wings dunked in hot and spicy peri peri glaze",
    imageUrl: "https://d1rgpf387mknul.cloudfront.net/products/PLP/web/2x_web_20260707073512151566_482x264jpg",
    category: "PERI PERI FEST",
    isVeg: false,
    basePrice: 269
  }
];

const seedPeriPeri = async () => {
  try {
    await mongoose.connect(config.MONGODB_URI);
    console.log('Connected to MongoDB');

    const admin = await User.findOne({ email: 'admin@velvetbytes.com' });
    if (!admin) {
      throw new Error('Admin user not found. Run standard seed first.');
    }

    console.log(`Found admin user: ${admin._id}`);

    for (const product of periPeriProducts) {
      console.log(`Processing ${product.name}...`);
      
      const exists = await MasterProduct.findOne({ name: product.name });
      if (exists) {
        console.log(`Product ${product.name} already exists. Skipping.`);
        continue;
      }

      console.log(`Uploading image from URL: ${product.imageUrl}`);
      const uploadedUrl = await uploadImageFromUrl(product.imageUrl);
      console.log(`Image uploaded to: ${uploadedUrl}`);

      const newProduct = new MasterProduct({
        ...product,
        imageUrl: uploadedUrl,
        createdBy: admin._id
      });

      await newProduct.save();
      console.log(`Saved product ${product.name} to database.\n`);
    }

    console.log('Successfully seeded Peri Peri products!');
  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    await mongoose.connection.close();
  }
};

seedPeriPeri();
