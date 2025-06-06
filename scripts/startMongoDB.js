const mongoose = require('mongoose');

const checkMongoDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/postman');
    console.log('Successfully connected to MongoDB!');
    console.log('\nYou can now run: npm run create-admin');
  } catch (error) {
    console.error('\nMongoDB Connection Error:', error.message);
    console.log('\nTo fix this:');
    console.log('1. Make sure MongoDB is installed on your system');
    console.log('2. Start MongoDB service:');
    console.log('   - Open Windows Services (services.msc)');
    console.log('   - Find "MongoDB" service');
    console.log('   - Right-click and select "Start"');
    console.log('\nOr run these commands in PowerShell as Administrator:');
    console.log('net start MongoDB');
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

checkMongoDB(); 