const express = require('express');
const router = express.Router();
const SpeakerSubmission = require('../models/SpeakerSubmission');
const validateSubmission = require('../middleware/validateSubmission');
const rateLimit = require('express-rate-limit');
const { sendSubmissionNotification } = require('../utils/emailService');

// Rate limiting middleware
const submissionLimiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS || 900000, // 15 minutes
  max: process.env.RATE_LIMIT_MAX || 100, // Limit each IP to 100 requests per windowMs
  message: {
    status: 'error',
    message: 'Too many submissions from this IP, please try again later'
  }
});

// Submit a new talk proposal
router.post('/submit', submissionLimiter, validateSubmission, async (req, res) => {
  try {
    const submission = new SpeakerSubmission(req.body);
    await submission.save();
    
    // Send email notification
    await sendSubmissionNotification(submission);
    
    res.status(201).json({
      status: 'success',
      message: 'Your proposal has been submitted successfully. We will contact you soon.',
      data: submission
    });
  } catch (error) {
    console.error('Submission error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Failed to submit proposal'
    });
  }
});

// Get all submissions (for admin use)
router.get('/', async (req, res) => {
  try {
    const submissions = await SpeakerSubmission.find().sort({ submittedAt: -1 });
    res.status(200).json({
      status: 'success',
      data: submissions
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch submissions'
    });
  }
});

module.exports = router; 