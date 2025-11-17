// models/Job.js
import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserAuth",
    required: true,
    index: true
  },

  title: { type: String, default: "" },
  company: { type: String, default: "" },
  location: { type: String, default: "" },

  jobType: { type: String, default: "" },
  experience: { type: String, default: "" },
  seniority: { type: String, default: "" },

  salary: { type: String, default: "" },

  skills: {
    type: [String],
    default: []
  },

  description: { type: String, default: "" },

  jobUrl: {
    type: String,
    required: true
  },

  source: { type: String, default: "" },
  rawText: { type: String, default: "" },

  llmVersion: { type: String, default: "gemini-2.5-flash" },

  scrapedAt: {
    type: Date,
    default: Date.now
  },

  parsedAt: {
    type: Date
  },

  // ---------- NEW FIELDS ----------
  applied: {
    type: Boolean,
    default: false
  },

  applicationStatus: {
    type: String,
    enum: ["not_applied", "applied", "in_review", "rejected", "selected"],
    default: "not_applied"
  },

  appliedAt: {
    type: Date,
    default: null
  }
  // ---------------------------------
},
{
  timestamps: true
});

// Prevent same user from saving same job twice
jobSchema.index({ userId: 1, jobUrl: 1 }, { unique: true });

// Useful for job searching/ranking
jobSchema.index({
  title: "text",
  company: "text",
  description: "text",
  skills: "text"
}, {
  weights: {
    title: 5,
    skills: 4,
    company: 3,
    description: 1
  }
});

export const Job = mongoose.model("Job", jobSchema);
export default Job;
