import express from "express";
import { 
  extractJobAI, 
  applyJob, 
  updateApplicationStatus,
  getFilteredJobs,
  getSingleJob,
  deleteJob,
} from "../controllers/jobController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const jobRoutes = express.Router();

// Extract job using AI
jobRoutes.post("/extract", authMiddleware, extractJobAI);


// Apply to a job (sets applied = true and applicationStatus = in_review)
jobRoutes.post("/apply/:jobId", authMiddleware, applyJob);

// Update application status (in_review, selected, rejected)
jobRoutes.patch("/status/:jobId", authMiddleware, updateApplicationStatus);

// getSingle Job details
jobRoutes.get("/:jobId", authMiddleware, getSingleJob);

// Unified filtering (all jobs, applied, not applied, in_review, selected, rejected)
jobRoutes.get("/", authMiddleware, getFilteredJobs);


jobRoutes.delete("/:jobId", authMiddleware, deleteJob);






export default jobRoutes;
