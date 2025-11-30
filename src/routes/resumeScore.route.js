import express from "express";
import { compareResumeContoller } from "../controllers/resumeScoreController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const resumeScoreRoute = express.Router();

resumeScoreRoute.post("/compare-resume", authMiddleware ,  compareResumeContoller)

export default resumeScoreRoute;