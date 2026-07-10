import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { uploadImage } from './src/shared/utils/cloudinary.js';

dotenv.config({ path: path.resolve('.env') });

const ASSETS_DIR = path.resolve('assets');
const PRODUCTS_FILE = path.resolve('products.html');

async function run() {
  console.log('Reading products.html...');
  const productsData = fs.readFileSync(PRODUCTS_FILE, 'utf8');
  let products;
  try {
    products = JSON.parse(productsData);
  } catch (err) {
    console.error('Failed to parse products.html as JSON:', err);
    return;
  }

  let uploadedCount = 0;

  for (const product of products) {
    const oldUrl = product.imageUrl;
    if (!oldUrl || !oldUrl.includes('cloudfront.net')) {
      continue; // Skip if no URL or already Cloudinary
    }

    // Example oldUrl: https://d1rgpf387mknul.cloudfront.net/products/PLP/web/2x_web_20260708172005408845_482x264jpg
    const parts = oldUrl.split('/');
    const filenameWithJpg = parts[parts.length - 1]; // "2x_web_2026..._482x264jpg"
    
    // Remove "jpg" or ".jpg" from the end to get the folder name
    const folderName = filenameWithJpg.replace(/\.?jpg$/i, '');
    
    const localFilePath = path.join(ASSETS_DIR, folderName, `${folderName}.jpg`);
    
    if (fs.existsSync(localFilePath)) {
      console.log(`Uploading ${folderName}.jpg for product: ${product.name}`);
      try {
        const buffer = fs.readFileSync(localFilePath);
        const result = await uploadImage(buffer, 'velvet-bytes/products');
        
        product.imageUrl = result.secure_url;
        uploadedCount++;
        console.log(` SUCCESS: ${result.secure_url}`);
      } catch (err) {
        console.error(` FAILED to upload ${localFilePath}:`, err.message);
      }
    } else {
      console.log(` File not found: ${localFilePath}`);
    }
  }

  console.log(`\nUpload complete. Total uploaded: ${uploadedCount}`);
  
  // Write back to products.html
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
  console.log('Successfully updated products.html with Cloudinary URLs.');
}

run();
