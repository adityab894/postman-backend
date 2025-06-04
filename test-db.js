require('dotenv').config();
const mongoose = require('mongoose');

async function testConnection() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Successfully connected to MongoDB Atlas!');

        // Create a test document
        const TestModel = mongoose.model('Test', new mongoose.Schema({
            name: String,
            createdAt: { type: Date, default: Date.now }
        }));

        // Insert a test document
        const testDoc = await TestModel.create({
            name: 'Test Document'
        });

        console.log('Successfully created test document:', testDoc);
        console.log('Database name:', mongoose.connection.db.databaseName);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        // Close the connection
        await mongoose.connection.close();
        console.log('Connection closed');
        process.exit(0);
    }
}

testConnection(); 