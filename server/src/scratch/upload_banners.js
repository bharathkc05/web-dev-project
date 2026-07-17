import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs/promises';
import { v2 as cloudinary } from 'cloudinary';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

if (process.env.CLOUDINARY_URL) {
  const parsedUrl = new URL(process.env.CLOUDINARY_URL);
  cloudinary.config({
    cloud_name: parsedUrl.hostname,
    api_key: parsedUrl.username,
    api_secret: parsedUrl.password,
  });
}

const bannerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  imageUrl: { type: String, required: true },
  linkUrl: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

const userSchema = new mongoose.Schema({ role: String });

const Banner = mongoose.models.Banner || mongoose.model('Banner', bannerSchema);
const User = mongoose.models.User || mongoose.model('User', userSchema);

const assetsToUpload = [
  '2x_ms_20260423051641086049_750x400'
];

async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const admin = await User.findOne({ role: 'ADMIN' });
    const createdBy = admin ? admin._id : new mongoose.Types.ObjectId();

    for (let i = 0; i < assetsToUpload.length; i++) {
      const assetDir = assetsToUpload[i];
      const dirPath = path.join(__dirname, '../../assets', assetDir);
      
      let files;
      try {
        files = await fs.readdir(dirPath);
      } catch(e) {
        console.log(`Directory ${assetDir} not found, skipping...`);
        continue;
      }
      
      if (files.length === 0) continue;
      
      const filePath = path.join(dirPath, files[0]);
      console.log(`Uploading ${filePath}...`);
      
      const result = await cloudinary.uploader.upload(filePath, { folder: 'ecom/banners' });
      
      const banner = new Banner({
        title: `Hero Banner 4 (Alternative)`,
        imageUrl: result.secure_url,
        order: 3, // Set this to index 3 so it goes before the 4th banner
        createdBy
      });
      await banner.save();
      console.log(`Saved alternative banner to DB: ${result.secure_url}`);
    }
    
    console.log('Finished uploading alternative banner');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

main();
