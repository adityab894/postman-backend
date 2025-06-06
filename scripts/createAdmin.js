require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');

const createAdmin = async () => {
  try {
    // Check if MONGODB_URI exists
    if (!process.env.MONGODB_URI) {
      console.error('Error: MONGODB_URI is not defined in .env file');
      process.exit(1);
    }

    console.log('Connecting to MongoDB...');
    console.log('Using URI:', process.env.MONGODB_URI);

    // Connect to MongoDB with options
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    });
    
    console.log('Connected to MongoDB successfully');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'admin@postman.in' });
    if (existingAdmin) {
      console.log('Admin account already exists');
      process.exit(0);
    }

    // Create new admin with your preferred credentials
    const hashedPassword = await bcrypt.hash('post@2025man', 10);
    const admin = new Admin({
      email: 'admin@postman.in',
      password: hashedPassword
    });

    await admin.save();
    console.log('Admin account created successfully');
    console.log('Email: admin@postman.in');
    console.log('Password: post@2025man');

  } catch (error) {
    console.error('Error creating admin:', error.message);
    if (error.name === 'MongooseServerSelectionError') {
      console.log('\nPossible solutions:');
      console.log('1. Check if your MongoDB URI is correct in .env file');
      console.log('2. Make sure your IP address is whitelisted in MongoDB Atlas');
      console.log('3. Check if your MongoDB Atlas cluster is running');
      console.log('4. Verify your MongoDB Atlas username and password');
    }
  } finally {
    try {
      await mongoose.disconnect();
      console.log('Disconnected from MongoDB');
    } catch (error) {
      console.error('Error disconnecting from MongoDB:', error.message);
    }
    process.exit(0);
  }
};

createAdmin(); 