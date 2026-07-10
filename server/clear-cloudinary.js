import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve('.env') });

if (process.env.CLOUDINARY_URL) {
  const parsedUrl = new URL(process.env.CLOUDINARY_URL);
  cloudinary.config({
    cloud_name: parsedUrl.hostname,
    api_key: parsedUrl.username,
    api_secret: parsedUrl.password,
  });
}

async function run() {
  try {
    console.log('Clearing images in Cloudinary prefix "velvet-bytes/products"...');
    
    // We can delete by prefix using the Admin API
    const result = await cloudinary.api.delete_resources_by_prefix('velvet-bytes/products');
    console.log('Deletion result:', result);

    console.log('Successfully cleared all images in velvet-bytes/products.');
  } catch (error) {
    console.error('Failed to clear Cloudinary:', error);
  }
}

run();
