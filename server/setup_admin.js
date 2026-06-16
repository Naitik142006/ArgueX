import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const setupAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');
    
    // 1. Remove admin privileges from ALL existing users
    const updateResult = await User.updateMany({}, { isAdmin: false });
    console.log(`Revoked admin access from ${updateResult.modifiedCount} users.`);
    
    // 2. Check if the specific admin account already exists
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@arguex.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'change_this_immediately';
    
    let adminUser = await User.findOne({ email: adminEmail });
    
    if (adminUser) {
      // If it exists, ensure it is the ONLY one with isAdmin = true
      adminUser.isAdmin = true;
      await adminUser.save();
      console.log('Admin account already exists. Re-enabled admin privileges for it.');
    } else {
      // If it doesn't exist, create it
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);
      
      adminUser = await User.create({
        username: 'ArgueX Admin',
        email: adminEmail,
        password: hashedPassword,
        isAdmin: true
      });
      console.log('Created new dedicated Admin account.');
    }
    
    console.log('\n--- ADMIN SETUP COMPLETE ---');
    console.log(`Email: ${adminEmail}`);
    console.log('Password: [HIDDEN FOR SECURITY - Set via ADMIN_PASSWORD in .env]');
    console.log('----------------------------\n');

    process.exit(0);
  } catch (error) {
    console.error('Error setting up admin account:', error);
    process.exit(1);
  }
};

setupAdmin();
