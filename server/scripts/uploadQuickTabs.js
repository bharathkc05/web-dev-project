import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import config from '../src/config/env.js';
import { QuickTab } from '../src/shared/models/quickTab.model.js';
import { uploadImage } from '../src/shared/utils/cloudinary.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ASSETS_DIR = path.join(__dirname, '../assets');

const quickTabsData = [
  {
    "name": "Peri Peri Fest",
    "imageUrl": "https://d1rgpf387mknul.cloudfront.net/category/Home/web/1x_web_20260707055347538820_114x101png"
  },
  {
    "name": "Crazy Deals",
    "imageUrl": "https://d1rgpf387mknul.cloudfront.net/category/Home/web/1x_web_20260624054726824128_114x101png"
  },
  {
    "name": "Starting @ 59",
    "imageUrl": "https://d1rgpf387mknul.cloudfront.net/category/Home/web/1x_web_20260624054607142937_114x101png"
  },
  {
    "name": "Mix'N'Match Combos",
    "imageUrl": "https://d1rgpf387mknul.cloudfront.net/category/Home/web/1x_web_20260123071813383448_114x101png"
  },
  {
    "name": "Whopper Deluxe (Reg. Size Bun)",
    "imageUrl": "https://d1rgpf387mknul.cloudfront.net/category/Home/web/1x_web_20260617085429127525_114x101png"
  },
  {
    "name": "Original Whopper (X L Size Bun)",
    "imageUrl": "https://d1rgpf387mknul.cloudfront.net/category/Home/web/1x_web_20240521084713813756_114x101png"
  },
  {
    "name": "Super Saver Meals",
    "imageUrl": "https://d1rgpf387mknul.cloudfront.net/category/Home/web/1x_web_20260624054525537139_114x101png"
  },
  {
    "name": "Burgers & Wraps",
    "imageUrl": "https://d1rgpf387mknul.cloudfront.net/category/Home/web/1x_web_20230510052712522360_114x101png"
  },
  {
    "name": "Snacks",
    "imageUrl": "https://d1rgpf387mknul.cloudfront.net/category/Home/web/1x_web_20210427112037534695_114x101png"
  },
  {
    "name": "Beverages",
    "imageUrl": "https://d1rgpf387mknul.cloudfront.net/category/Home/web/1x_web_20240410063942722493_114x101png"
  },
  {
    "name": "Desserts",
    "imageUrl": "https://d1rgpf387mknul.cloudfront.net/category/Home/web/1x_web_20260624054923778968_114x101png"
  },
  {
    "name": "BK Cafe",
    "imageUrl": "https://d1rgpf387mknul.cloudfront.net/category/Home/web/1x_web_20230323093839166957_114x101png"
  }
];

const uploadQuickTabs = async () => {
  try {
    await mongoose.connect(config.MONGODB_URI);
    console.log('Connected to MongoDB');

    let uploadedCount = 0;

    for (const tabData of quickTabsData) {
      console.log(`Processing Quick Tab: ${tabData.name}`);
      
      const parts = tabData.imageUrl.split('/');
      const folderName = parts[parts.length - 1]; // e.g. "1x_web_20260707055347538820_114x101png"
      
      // Try to find the file inside the folder (either .jpg or .png)
      const possibleExtensions = ['.jpg', '.png', ''];
      let localFilePath = null;
      let found = false;

      for (const ext of possibleExtensions) {
        localFilePath = path.join(ASSETS_DIR, folderName, `${folderName}${ext}`);
        if (fs.existsSync(localFilePath)) {
          found = true;
          break;
        }
      }

      if (!found) {
        console.error(`  [FAILED] Could not find local file for ${folderName}`);
        continue;
      }

      console.log(`  Found local file: ${localFilePath}. Uploading to Cloudinary...`);
      const buffer = fs.readFileSync(localFilePath);
      const result = await uploadImage(buffer, 'velvet-bytes/quicktabs');
      
      console.log(`  [SUCCESS] Uploaded to: ${result.secure_url}`);

      // Map the string name to uppercase for matching (since in DB they are uppercase like "PERI PERI FEST", or try case-insensitive)
      const tabNameRegex = new RegExp(`^${tabData.name}$`, 'i');
      
      // Update the DB
      const resultUpdate = await QuickTab.findOneAndUpdate(
        { name: tabNameRegex },
        { imageUrl: result.secure_url },
        { new: true }
      );

      if (resultUpdate) {
        console.log(`  [SUCCESS] Updated MongoDB QuickTab: ${resultUpdate.name}`);
        uploadedCount++;
      } else {
        console.warn(`  [WARNING] QuickTab not found in MongoDB matching: ${tabData.name}`);
      }
    }

    console.log(`\nCompleted. Successfully uploaded and updated ${uploadedCount} Quick Tabs.`);
  } catch (error) {
    console.error('Script failed:', error);
  } finally {
    await mongoose.connection.close();
  }
};

uploadQuickTabs();
