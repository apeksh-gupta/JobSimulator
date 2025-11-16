import express from "express";
import { extractJobAI, getAllJobs } from "../controllers/jobController.js";

const jobRoutes = express.Router();

jobRoutes.post("/extract" , extractJobAI);
jobRoutes.get("/all" , getAllJobs)

export default jobRoutes;