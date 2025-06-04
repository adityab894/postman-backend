const mongoose = require('mongoose');

const sponsorSchema = new mongoose.Schema({
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
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  jobTitle: {
    type: String,
    trim: true
  },
  package: {
    type: String,
    required: [true, 'Sponsorship package is required'],
    enum: ['Gold', 'Silver', 'Bronze', 'Community']
  },
  message: {
    type: String,
    trim: true
  },
  additionalOptions: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Sponsor = mongoose.model('Sponsor', sponsorSchema);

module.exports = Sponsor; 