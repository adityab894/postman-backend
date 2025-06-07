require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const xss = require('xss-clean');
const morgan = require('morgan');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const auth = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5002;

app.use(helmet()); 
app.use(xss()); 
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'https://postmancommunitypune.in',
  'https://www.postmancommunitypune.in',
  'https://postman-frontend-alpha.vercel.app',
  'https://postman-frontend.vercel.app'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept', 'X-Requested-With'],
  exposedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Add security headers middleware
app.use((req, res, next) => {
  res.set('Cross-Origin-Resource-Policy', 'cross-origin');
  res.set('Access-Control-Allow-Credentials', 'true');
  next();
});

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
const eventRoutes = require('./routes/events');
const registrationRoutes = require('./routes/registrations');
const adminAuthRoutes = require('./routes/adminAuth');

app.use('/api/speakers', speakerRoutes);
app.use('/api/sponsors', sponsorRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/admin/auth', adminAuthRoutes);

// Protected admin routes
app.use('/api/admin/events', auth, eventRoutes);
app.use('/api/admin/registrations', auth, registrationRoutes);

// Add root route handler
app.get('/', (req, res) => {
  res.status(200).json({ 
    status: 'success',
    message: 'Welcome to the Postman Conference API',
    endpoints: {
      speakers: '/api/speakers',
      sponsors: '/api/sponsors',
      email: '/api/email',
      events: '/api/events',
      registrations: '/api/registrations',
      health: '/health'
    }
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
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
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Only start the server if we're not in a serverless environment
    if (process.env.NODE_ENV !== 'production') {
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
    }

  } catch (error) {
    console.error('MongoDB connection error:', error);
    if (process.env.NODE_ENV !== 'production') {
      console.log('Retrying database connection in 5 seconds...');
      setTimeout(connectDB, 5000);
    } else {
      process.exit(1);
    }
  }
};

// Connect to database
connectDB();

// Error handling
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1);
  }
});

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1);
  }
});

// Export the Express app for Vercel
module.exports = app;
