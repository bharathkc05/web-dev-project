import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const clearCollections = async () => {
  try {
    console.log('Connecting to', process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');
    
    const db = mongoose.connection.db;
    await db.collection('masterproducts').deleteMany({});
    console.log('Cleared masterproducts collection');
    
    await db.collection('outletproducts').deleteMany({});
    console.log('Cleared outletproducts collection');
    
    console.log('Done!');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

clearCollections();
