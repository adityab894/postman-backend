const express = require("express");
const router = express.Router();
const SpeakerSubmission = require("../models/SpeakerSubmission");
const validateSubmission = require("../middleware/validateSubmission");
const rateLimit = require("express-rate-limit");
const { sendSubmissionNotification } = require("../utils/emailService");

const submissionLimiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS || 900000,
  max: process.env.RATE_LIMIT_MAX || 100,
  message: {
    status: "error",
    message: "Too many submissions from this IP, please try again later",
  },
});

router.post(
  "/submit",
  submissionLimiter,
  validateSubmission,
  async (req, res) => {
    try {
      const submission = new SpeakerSubmission(req.body);
      await submission.save();

      await sendSubmissionNotification(submission);

      res.status(201).json({
        status: "success",
        message:
          "Your proposal has been submitted successfully. We will contact you soon.",
        data: submission,
      });
    } catch (error) {
      console.error("Submission error:", error);
      res.status(400).json({
        status: "error",
        message: error.message || "Failed to submit proposal",
      });
    }
  }
);

router.get("/", async (req, res) => {
  try {
    const submissions = await SpeakerSubmission.find().sort({
      submittedAt: -1,
    });
    res.status(200).json({
      status: "success",
      data: submissions,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to fetch submissions",
    });
  }
});

module.exports = router;
