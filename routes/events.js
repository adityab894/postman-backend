const express = require('express');
const router = express.Router();
const Event = require('../models/Event');

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
router.post('/create', async (req, res) => {
  try {
    console.log('Received event data:', {
      ...req.body,
      image: req.body.image ? 'Image data present (truncated)' : 'No image'
    }); // Debug log with truncated image data

    // Validate required fields
    const requiredFields = ['title', 'description', 'date', 'time', 'location', 'availableSeats'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      console.log('Missing required fields:', missingFields);
      return res.status(400).json({
        message: 'Missing required fields',
        fields: missingFields
      });
    }

    // Validate date format
    const eventDate = new Date(req.body.date);
    if (isNaN(eventDate.getTime())) {
      console.log('Invalid date format:', req.body.date);
      return res.status(400).json({
        message: 'Invalid date format'
      });
    }

    // Validate available seats
    const availableSeats = parseInt(req.body.availableSeats);
    if (isNaN(availableSeats) || availableSeats < 1) {
      console.log('Invalid available seats:', req.body.availableSeats);
      return res.status(400).json({
        message: 'Available seats must be a positive number'
      });
    }

    // Create event data object
    const eventData = {
      title: req.body.title.trim(),
      description: req.body.description.trim(),
      detailedDescription: req.body.detailedDescription?.trim() || '',
      date: eventDate,
      time: req.body.time,
      location: req.body.location.trim(),
      availableSeats: availableSeats,
      image: req.body.image || '' // Store the image URL directly
    };

    console.log('Creating event with data:', {
      ...eventData,
      image: eventData.image ? 'Image data present (truncated)' : 'No image'
    }); // Debug log with truncated image data

    // Create and save the event
    const event = new Event(eventData);
    const savedEvent = await event.save();

    console.log('Event created successfully:', {
      ...savedEvent.toObject(),
      image: savedEvent.image ? 'Image data present (truncated)' : 'No image'
    }); // Debug log with truncated image data

    // Send success response
    res.status(201).json({
      message: 'Event created successfully',
      event: savedEvent
    });
  } catch (error) {
    console.error('Error creating event:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      console.log('Validation errors:', validationErrors);
      return res.status(400).json({
        message: 'Validation error',
        errors: validationErrors
      });
    }

    // Handle other errors
    res.status(500).json({
      message: 'Error creating event',
      error: error.message
    });
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

// Delete event
router.delete('/:id', async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: 'Error deleting event', error: error.message });
  }
});

// Update event
router.put('/:id', async (req, res) => {
  try {
    // First find the event to ensure it exists
    const existingEvent = await Event.findById(req.params.id);
    if (!existingEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Prepare update data, only including fields that are present in the request
    const updateData = {};
    if (req.body.title) updateData.title = req.body.title;
    if (req.body.description) updateData.description = req.body.description;
    if (req.body.detailedDescription !== undefined) updateData.detailedDescription = req.body.detailedDescription;
    if (req.body.date) updateData.date = new Date(req.body.date);
    if (req.body.time) updateData.time = req.body.time;
    if (req.body.location) updateData.location = req.body.location;
    if (req.body.availableSeats) updateData.availableSeats = parseInt(req.body.availableSeats);
    
    // Handle image update
    if (req.body.image !== undefined) {
      // If image is null or empty string, remove the image
      if (!req.body.image) {
        updateData.image = undefined;
      } else {
        updateData.image = req.body.image;
      }
    }

    // Update the event with only the provided fields
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { 
        new: true, 
        runValidators: true,
        context: 'query'
      }
    );

    res.json(updatedEvent);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ 
      message: 'Error updating event', 
      error: error.message,
      details: error.errors ? Object.values(error.errors).map(err => err.message) : undefined
    });
  }
});

module.exports = router; 