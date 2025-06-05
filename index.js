require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const xss = require('xss-clean');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 5002;


app.use(helmet()); 
app.use(xss()); 
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));


app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:5173',  // Local frontend
      'http://localhost:3000',  // Alternative local frontend port
      'https://postman-frontend-five.vercel.app',  // Production frontend
      'https://postman-frontend-five.vercel.app/',  // Production frontend with trailing slash
      'https://www.postmancommunitypune.in',  // Main production domain
      'http://www.postmancommunitypune.in',   // HTTP version
      'https://postmancommunitypune.in',      // Without www
      'http://postmancommunitypune.in'        // HTTP without www
    ];
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      console.log('Blocked origin:', origin); // Add logging for debugging
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept']
}));

// Add CORS debugging
app.use((req, res, next) => {
  console.log('Incoming request:', {
    url: req.url,
    method: req.method,
    origin: req.headers.origin,
    headers: req.headers
  });
  next();
});


if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Routes
const speakerRoutes = require('./routes/speakerRoutes');
const sponsorRoutes = require('./routes/sponsorRoutes');
const emailRoutes = require('./routes/emailRoutes');

app.use('/api/speakers', speakerRoutes);
app.use('/api/sponsors', sponsorRoutes);
app.use('/api/email', emailRoutes);

// Add root route handler
app.get('/', (req, res) => {
  res.status(200).json({ 
    status: 'success',
    message: 'Welcome to the Postman Conference API',
    endpoints: {
      speakers: '/api/speakers',
      sponsors: '/api/sponsors',
      email: '/api/email',
      health: '/health'
    }
  });
});

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

// 404 handler - must be last
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Can't find ${req.originalUrl} on this server!`
  });
});

// Database connection with retry logic
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/postman-conference', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    const server = app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Please try a different port.`);
        process.exit(1);
      } else {
        console.error('Server error:', err);
        process.exit(1);
      }
    });

  } catch (error) {
    console.error('MongoDB connection error:', error);
    console.log('Retrying database connection in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
};

connectDB();

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

// Export the Express app for Vercel
module.exports = app;
