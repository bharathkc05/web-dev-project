import mongoose from 'mongoose';

const run = async () => {
  await mongoose.connect('mongodb+srv://bharathkc05:dRFE6kvJBExPFnp8@cluster0.zp1lt.mongodb.net/?appName=Cluster0');
  
  const QuickTab = mongoose.model('QuickTab', new mongoose.Schema({ name: String }));
  const MasterProduct = mongoose.model('MasterProduct', new mongoose.Schema({ name: String, quickTab: mongoose.Schema.Types.ObjectId, category: mongoose.Schema.Types.ObjectId }));
  
  const tabs = await QuickTab.find({ name: { $in: ['BEVERAGES', 'DESSERTS', 'BK CAFE'] } });
  console.log('Tabs:', tabs);
  
  for (const tab of tabs) {
    const count = await MasterProduct.countDocuments({ quickTab: tab._id });
    console.log(tab.name, 'Products count with quickTab matching:', count);
    
    // Also check if any products match by category instead of quicktab, just in case
    const countCat = await MasterProduct.countDocuments({ category: tab._id });
    console.log(tab.name, 'Products count with category matching:', countCat);
  }
  process.exit(0);
};

run();
