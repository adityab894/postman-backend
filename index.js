require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const xss = require('xss-clean');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 5002;

// Security Middleware
app.use(helmet()); // Set security HTTP headers
app.use(xss()); // Sanitize request data
app.use(express.json({ limit: '10kb' })); // Body parser, reading data from body into req.body
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// CORS setup
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : '*',  // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Routes
const speakerRoutes = require('./routes/speakerRoutes');
const sponsorRoutes = require('./routes/sponsorRoutes');

app.use('/api/speakers', speakerRoutes);
app.use('/api/sponsors', sponsorRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Something went wrong!'
  });
});

// Handle unhandled routes
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Can't find ${req.originalUrl} on this server!`
  });
});

// Database connection
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/postman-conference')
  .then(() => {
    console.log('Connected to MongoDB');
    console.log('Environment:', process.env.NODE_ENV);
    console.log('MongoDB URI exists:', !!process.env.MONGODB_URI);
    console.log('Frontend URL:', process.env.FRONTEND_URL || 'Not set');
    
    if (process.env.NODE_ENV !== 'production') {
      // Only start the server directly in non-production environments
      const server = app.listen(PORT, () => {
        console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
        console.log('Server started at:', new Date().toISOString());
      });
    }
  })
  .catch((err) => {
    console.error('MongoDB connection error details:', {
      name: err.name,
      message: err.message,
      code: err.code,
      environment: process.env.NODE_ENV,
      hasMongoDB_URI: !!process.env.MONGODB_URI
    });
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

// Export the Express app for Vercel
module.exports = app;
