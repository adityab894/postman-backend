const mongoose = require('mongoose');

const emailSubmissionSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  userEmail: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  userInterest: {
    type: String,
    required: [true, 'Interest area is required'],
    enum: ['Volunteer', 'Management', 'Social Media', 'Content Creation', 'Design']
  },
  userNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    minlength: [10, 'Phone number must be at least 10 digits'],
    maxlength: [15, 'Phone number must be at most 15 digits'],
    trim: true,
    unique: true
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

const EmailSubmission = mongoose.model('EmailSubmission', emailSubmissionSchema);

module.exports = EmailSubmission; 