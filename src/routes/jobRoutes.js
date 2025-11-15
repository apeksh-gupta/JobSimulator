import express from "express";
import { addJob, getAllJobs } from "../controllers/jobController.js";

const jobRoutes = express.Router();

jobRoutes.post("/add" , addJob);
jobRoutes.get("/all" , getAllJobs)

export default jobRoutes;