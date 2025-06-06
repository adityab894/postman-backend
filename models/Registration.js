const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
  },
  githubAccount: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return !v || v.startsWith('https://github.com/');
      },
      message: 'GitHub profile must be a valid GitHub URL'
    }
  },
  linkedinId: {
    type: String,
    required: [true, 'LinkedIn profile is required'],
    trim: true,
    validate: {
      validator: function(v) {
        return v.startsWith('https://www.linkedin.com/') || v.startsWith('https://linkedin.com/');
      },
      message: 'LinkedIn profile must be a valid LinkedIn URL'
    }
  },
  portfolio: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        if (!v) return true;
        try {
          new URL(v);
          return true;
        } catch (e) {
          return false;
        }
      },
      message: 'Portfolio must be a valid URL'
    }
  },
  registeredAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Add compound index to prevent duplicate registrations
registrationSchema.index({ eventId: 1, email: 1 }, { unique: true });

// Add pre-save middleware to validate event capacity
registrationSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      const Event = mongoose.model('Event');
      const event = await Event.findById(this.eventId);
      
      if (!event) {
        throw new Error('Event not found');
      }

      // Check if event date has passed
      if (new Date(event.date) < new Date()) {
        throw new Error('Registration is closed for past events');
      }

      // Check available seats
      const registrationCount = await this.constructor.countDocuments({ eventId: this.eventId });
      if (registrationCount >= event.availableSeats) {
        throw new Error('No seats available for this event');
      }
    } catch (error) {
      next(error);
    }
  }
  next();
});

const Registration = mongoose.model('Registration', registrationSchema);

module.exports = Registration; 