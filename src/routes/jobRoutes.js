import express from "express";
import { 
  extractJobAI, 
  applyJob, 
  updateApplicationStatus,
  getFilteredJobs
} from "../controllers/jobController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const jobRoutes = express.Router();

// Extract job using AI
jobRoutes.post("/extract", authMiddleware, extractJobAI);

// Apply to a job (sets applied = true and applicationStatus = in_review)
jobRoutes.put("/apply/:jobId", authMiddleware, applyJob);

// Update application status (in_review, selected, rejected)
jobRoutes.put("/status/:jobId", authMiddleware, updateApplicationStatus);

// Unified filtering (all jobs, applied, not applied, in_review, selected, rejected)
jobRoutes.get("/", authMiddleware, getFilteredJobs);

export default jobRoutes;
