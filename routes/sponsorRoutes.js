const express = require("express");
const router = express.Router();
const SponsorSubmission = require("../models/SponsorSubmission");
const { sendSponsorNotification } = require("../utils/emailService");

router.post("/submit", async (req, res) => {
  try {
    const {
      name,
      email,
      company,
      phone,
      jobTitle,
      package,
      message,
      additionalOptions,
    } = req.body;

    if (!name || !email || !company || !phone || !package) {
      return res.status(400).json({
        status: "error",
        message: "Please provide all required fields",
        errors: [
          { field: "name", message: !name ? "Name is required" : null },
          { field: "email", message: !email ? "Email is required" : null },
          {
            field: "company",
            message: !company ? "Company name is required" : null,
          },
          {
            field: "phone",
            message: !phone ? "Phone number is required" : null,
          },
          {
            field: "package",
            message: !package ? "Sponsorship package is required" : null,
          },
        ].filter((error) => error.message),
      });
    }

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid email format",
      });
    }

    if (phone.length < 10) {
      return res.status(400).json({
        status: "error",
        message: "Invalid phone number",
      });
    }

    const validPackages = ["TITLE", "GOLD","SILVER", "ASSOCIATE", "IN KIND"];
    if (!validPackages.includes(package)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid sponsorship package",
      });
    }

    const sponsorSubmission = await SponsorSubmission.create({
      name,
      email,
      company,
      phone,
      jobTitle,
      package,
      message,
      additionalOptions,
      submittedAt: new Date(),
    });

    try {
      await sendSponsorNotification(sponsorSubmission);
    } catch (emailError) {
      console.error("Failed to send email notification:", emailError);
    }

    res.status(201).json({
      status: "success",
      message: "Sponsorship request submitted successfully",
      data: {
        sponsor: {
          id: sponsorSubmission._id,
          name: sponsorSubmission.name,
          email: sponsorSubmission.email,
          company: sponsorSubmission.company,
          package: sponsorSubmission.package,
          status: sponsorSubmission.status,
        },
      },
    });
  } catch (error) {
    console.error("Sponsor submission error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        status: "error",
        message: "A sponsorship request with this email already exists",
      });
    }

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
      message: "Something went wrong while submitting the sponsorship request",
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const sponsors = await SponsorSubmission.find().sort({ createdAt: -1 });
    res.status(200).json({
      status: "success",
      results: sponsors.length,
      data: {
        sponsors,
      },
    });
  } catch (error) {
    console.error("Error fetching sponsors:", error);
    res.status(500).json({
      status: "error",
      message: "Error fetching sponsorship requests",
    });
  }
});

module.exports = router;
