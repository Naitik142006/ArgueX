import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './server/models/User.js';

dotenv.config({ path: './server/.env' });

const makeAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');
    
    // Set all users to admin for demo purposes, or update a specific user
    const result = await User.updateMany({}, { isAdmin: true });
    
    console.log(`Updated ${result.modifiedCount} users to be admin.`);
    
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

makeAdmin();
