import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const makeAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');
    
    const result = await User.updateMany({}, { isAdmin: true });
    
    console.log(`Updated ${result.modifiedCount} users to be admin.`);
    
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

makeAdmin();
