const express = require("express");
const router = express.Router();
const EmailSubmission = require("../models/EmailSubmission");
const { sendEmailNotification } = require("../utils/emailService");

router.post("/submit", async (req, res) => {
  try {
    const { userName, userEmail, userInterest, userNumber } = req.body;

    if (!userName || !userEmail || !userInterest || !userNumber) {
      return res.status(400).json({
        status: "error",
        message: "Please provide all required fields",
        errors: [
          { field: "userName", message: !userName ? "Name is required" : null },
          {
            field: "userEmail",
            message: !userEmail ? "Email is required" : null,
          },
          {
            field: "userInterest",
            message: !userInterest ? "Interest area is required" : null,
          },
          {
            field: "userNumber",
            message: !userNumber ? "Phone number is required" : null,
          },
        ].filter((error) => error.message),
      });
    }

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(userEmail)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid email format",
      });
    }

    const existingSubmission = await EmailSubmission.findOne({ userEmail });
    if (existingSubmission) {
      return res.status(400).json({
        status: "error",
        message: "You have already submitted an interest form with this email",
      });
    }

    const submission = await EmailSubmission.create({
      userName,
      userEmail,
      userInterest,
      userNumber,
      submittedAt: new Date(),
    });

    try {
      await sendEmailNotification(submission);
      console.log(
        "Email notifications sent successfully for submission:",
        submission._id
      );
    } catch (emailError) {
      console.error("Failed to send email notification:", emailError);
    }

    res.status(201).json({
      status: "success",
      message: "Form submitted successfully",
      data: {
        submission: {
          id: submission._id,
          userName: submission.userName,
          userEmail: submission.userEmail,
          userInterest: submission.userInterest,
          userNumber: submission.userNumber,
          submittedAt: submission.submittedAt,
        },
      },
    });
  } catch (error) {
    console.error("Submission error:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => ({
        field: err.path,
        message: err.message,
      }));

      return res.status(400).json({
        status: "error",
        message: "Validation error",
        errors,
      });
    }

    res.status(500).json({
      status: "error",
      message: "Something went wrong while submitting the form",
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const submissions = await EmailSubmission.find().sort({ submittedAt: -1 });
    res.status(200).json({
      status: "success",
      results: submissions.length,
      data: {
        submissions,
      },
    });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    res.status(500).json({
      status: "error",
      message: "Error fetching submissions",
    });
  }
});

module.exports = router;
