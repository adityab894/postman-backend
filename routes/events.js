const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const Event = require('../models/Event');
const fs = require('fs');
const cors = require('cors');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads/events');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueFilename = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueFilename);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload an image.'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Configure CORS options for static files
const staticFilesCors = cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://postman-frontend-five.vercel.app',
      'https://www.postmancommunitypune.in',
      'http://www.postmancommunitypune.in',
      'https://postmancommunitypune.in',
      'http://postmancommunitypune.in'
    ];
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
});

// Serve static files from the uploads directory with CORS
router.use('/uploads', staticFilesCors, express.static(uploadDir, {
  setHeaders: function (res, path) {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    res.set('Access-Control-Allow-Credentials', 'true');
  }
}));

// Get all events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find().sort({ date: -1 });
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Error fetching events', error: error.message });
  }
});

// Get single event by ID
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ message: 'Error fetching event', error: error.message });
  }
});

// Create new event
router.post('/create', upload.single('image'), async (req, res) => {
  try {
    const eventData = {
      title: req.body.title,
      description: req.body.description,
      detailedDescription: req.body.detailedDescription,
      date: new Date(req.body.date),
      time: req.body.time,
      location: req.body.location,
      availableSeats: parseInt(req.body.availableSeats),
    };

    // Save image path if file was uploaded
    if (req.file) {
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? process.env.BACKEND_URL 
        : 'http://localhost:5002';
      // Store the complete URL for the image
      eventData.image = `${baseUrl}/api/events/uploads/${req.file.filename}`;
    }

    const event = new Event(eventData);
    await event.save();
    res.status(201).json(event);
  } catch (error) {
    // If there was an error and a file was uploaded, delete it
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Error creating event', error: error.message });
  }
});

// Register for an event
router.post('/:id/register', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if seats are available
    if (event.registrations.length >= event.availableSeats) {
      return res.status(400).json({ message: 'No seats available' });
    }

    // Add registration
    event.registrations.push(req.body.userId || 'anonymous');
    await event.save();

    res.json({ message: 'Successfully registered for event' });
  } catch (error) {
    console.error('Error registering for event:', error);
    res.status(500).json({ message: 'Error registering for event', error: error.message });
  }
});

// Delete event and its image
router.delete('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Delete the image file if it exists
    if (event.image) {
      const imagePath = path.join(uploadDir, path.basename(event.image));
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: 'Error deleting event', error: error.message });
  }
});

// Update event
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const eventData = {
      title: req.body.title,
      description: req.body.description,
      detailedDescription: req.body.detailedDescription,
      date: new Date(req.body.date),
      time: req.body.time,
      location: req.body.location,
      availableSeats: parseInt(req.body.availableSeats),
    };

    // If a new image was uploaded
    if (req.file) {
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? process.env.BACKEND_URL 
        : 'http://localhost:5002';
      eventData.image = `${baseUrl}/api/events/uploads/${req.file.filename}`;

      // Delete old image if it exists
      const oldEvent = await Event.findById(req.params.id);
      if (oldEvent && oldEvent.image) {
        const oldImagePath = path.join(uploadDir, path.basename(oldEvent.image));
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }

    const event = await Event.findByIdAndUpdate(
      req.params.id,
      eventData,
      { new: true, runValidators: true }
    );

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    // If there was an error and a file was uploaded, delete it
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }
    console.error('Error updating event:', error);
    res.status(500).json({ message: 'Error updating event', error: error.message });
  }
});

module.exports = router; 