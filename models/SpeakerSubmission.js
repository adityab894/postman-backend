const mongoose = require("mongoose");

const speakerSubmissionSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
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
    organization: {
      type: String,
      required: [true, "Organization is required"],
      trim: true,
      maxlength: [100, "Organization name cannot be more than 100 characters"],
    },
    talkTitle: {
      type: String,
      required: [true, "Talk title is required"],
      trim: true,
      maxlength: [200, "Talk title cannot be more than 200 characters"],
    },
    talkType: {
      type: String,
      required: [true, "Talk type is required"],
      enum: {
        values: ["technical", "casestudy", "workshop", "lightning"],
        message: "Invalid talk type",
      },
    },
    talkDescription: {
      type: String,
      required: [true, "Talk description is required"],
      trim: true,
      minlength: [50, "Description must be at least 50 characters long"],
      maxlength: [1000, "Description cannot be more than 1000 characters"],
    },
    previousSpeakingExperience: {
      type: Boolean,
      default: false,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },

    speakerBio: {
      type: String,
      trim: true,
      maxlength: [500, "Speaker bio cannot exceed 500 characters"],
    },
    socialLinks: {
      linkedin: String,
      twitter: String,
      github: String,
    },
    preferredTimeSlot: {
      type: String,
      enum: ["morning", "afternoon", "evening", "any"],
      default: "any",
    },
    additionalNotes: {
      type: String,
      trim: true,
      maxlength: [500, "Additional notes cannot exceed 500 characters"],
    },
    adminNotes: {
      type: String,
      trim: true,
      maxlength: [1000, "Admin notes cannot exceed 1000 characters"],
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

speakerSubmissionSchema.index({ email: 1 });
speakerSubmissionSchema.index({ submittedAt: -1 });
speakerSubmissionSchema.index({ talkType: 1 });

speakerSubmissionSchema.pre("save", function (next) {
  this.lastUpdated = new Date();
  next();
});

const SpeakerSubmission = mongoose.model(
  "SpeakerSubmission",
  speakerSubmissionSchema
);

module.exports = SpeakerSubmission;
