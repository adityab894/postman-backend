const mongoose = require("mongoose");

const sponsorSubmissionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot be more than 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    company: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
      maxlength: [100, "Company name cannot be more than 100 characters"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      match: [/^\+?[\d\s-]{10,}$/, "Please enter a valid phone number"],
    },
    jobTitle: {
      type: String,
      trim: true,
      maxlength: [100, "Job title cannot be more than 100 characters"],
    },
    package: {
      type: String,
      required: [true, "Sponsorship package is required"],
      enum: {
        values: ["TITLE", "GOLD","SILVER", "ASSOCIATE", "IN KIND"],
        message: "Invalid sponsorship package",
      },
    },
    message: {
      type: String,
      trim: true,
      maxlength: [1000, "Message cannot be more than 1000 characters"],
    },
    additionalOptions: [
      {
        type: String,
        trim: true,
      },
    ],
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

sponsorSubmissionSchema.index({ email: 1 });
sponsorSubmissionSchema.index({ company: 1 });
sponsorSubmissionSchema.index({ submittedAt: -1 });
sponsorSubmissionSchema.index({ package: 1 });

const SponsorSubmission = mongoose.model(
  "SponsorSubmission",
  sponsorSubmissionSchema
);

module.exports = SponsorSubmission;
