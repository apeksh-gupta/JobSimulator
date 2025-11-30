import dotenv from "dotenv";
dotenv.config();

import Job from "../models/jobSchema.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --------------------------------------------------
// 1) Extract Job via Gemini AI
// --------------------------------------------------
export const extractJobAI = async (req, res) => {
  try {
    const userId = req.user?.userId; // from authMiddleware

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { mainText, metaDescription, pageTitle, jobUrl } = req.body;

    if (!mainText || !jobUrl) {
      return res.status(400).json({
        error: "mainText and jobUrl are required",
      });
    }

    // Prevent duplicate for same user
    const existing = await Job.findOne({ userId, jobUrl });

    if (existing) {
      return res.status(200).json({
        message: "Job already exists",
        job: existing,
      });
    }

    // ----------- Improved Prompt for Better JSON -----------
    const prompt = `
      You are a strict JSON extraction engine.
      Extract job information from the data below.

      You MUST return ONLY VALID JSON in this format:
      {
        "title": "",
        "company": "",
        "location": "",
        "jobType": "",
        "experience": "",
        "seniority": "",
        "skills": [],
        "salary": "",
        "description": "",
        "jobUrl": ""
      }

      - Do NOT include comments.
      - Do NOT add markdown.
      - Do NOT add explanations.
      - Empty fields must remain empty strings.

      RAW INPUT:
      TITLE: ${pageTitle}
      META: ${metaDescription}
      CONTENT: ${mainText}
      URL: ${jobUrl}
    `;

    // -------------------------------------------------------
    // Gemini Request
    // -------------------------------------------------------
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);

    let text = result.response.text();
    text = text.replace(/```json|```/g, "").trim();

    // Check JSON validity
    let extracted;

    try {
      extracted = JSON.parse(text);
    } catch (err) {
      // Try to auto-fix some common JSON issues
      try {
        const fixed = text
          .replace(/\n/g, "")
          .replace(/,\s*}/g, "}")
          .replace(/,\s*]/g, "]");
        extracted = JSON.parse(fixed);
      } catch (err2) {
        return res.status(500).json({
          error: "AI returned invalid JSON",
          rawResponse: text,
        });
      }
    }

    // ----- Build final job data -----
    const jobData = {
      ...extracted,
      userId,
      jobUrl,
      source: new URL(jobUrl).hostname,
      rawText: mainText,
      parsedAt: new Date(),
      applied: false,
      applicationStatus: "not_applied",
      appliedAt: null,
      llmVersion: "gemini-2.5-flash",
    };

    const job = await Job.create(jobData);

    return res.status(201).json({
      message: "Job extracted and saved successfully",
      job,
    });

  } catch (error) {
    console.error("AI Extract Error:", error);
    res.status(500).json({ error: "Server error during AI extraction" });
  }
};

// --------------------------------------------------
// 2) Mark Job as Applied
// --------------------------------------------------
export const applyJob = async (req , res) => {
  try {
    const userId = req.user?.userId;
    const { jobId } = req.params;

    if(!userId) {
      return res.status(401).json({error: "Unauthorized" });
    }
    if(!jobId) {
      return res.status(400).json({error: "Job Id is required" });
    }

    const job = await Job.findOne({_id: jobId, userId});

    if(!job){
      return res.status(404).json({error: "Job not Found or unauthorized"});
    }
    
    if (job.applied === true){
      return res.status(400).json({error: "Job already marked as applied"});
    }
    job.applied = true;
    job.applicationStatus = "in_review";
    job.appliedAt = new Date();

    await job.save();

    return res.json({
    message: "Job marked as applied successfully",
    job
    });

  } catch (error) {
    console.error("Apply Job Error", error);
    res.status(500).json({error: "Failed to apply for job"});
  }
};

// --------------------------------------------------
// 3) Update Job Application Status
// --------------------------------------------------
export const updateApplicationStatus = async (req , res) => {
  try {
    const userId = req.user?.userId;
    const { jobId } = req.params;
    const { status } = req.body;
    const allowedStatus =  ["in_review", "rejected", "selected"];

    if(!allowedStatus.includes(status)){
      return res.status(400).json({error: "Invalid applicationStatus"});
    }

    const job = await Job.findOne({_id:jobId , userId});

    if(!job){
      return res.status(404).json({error: "Job not found or unauthorized"});
    }

    if(job.applied === false){
      return res.status(400).json({
        error: "You must apply before setting application status"
      });
    }

    job.applicationStatus = status;
    await job.save();

    res.json({
      message: `Status updated to ${status}`,
      job
    });

  } catch (error) {
    console.error("Status Update Error", error);
    res.status(500).json({error: "failed to update status"});
  }
};

// --------------------------------------------------
// 4) get unified filtering
// --------------------------------------------------
export const getFilteredJobs = async (req , res) => {
  try {
    const userId = req.user?.userId;
    const { filter } = req.query;

    if(!userId){
      return res.status(401).json({error: "Unauthorized access"});
    }

    let query = { userId };

    switch (filter) {
      case "applied":
        query.applied = true;
        break;
      case "not_applied":
        query.applied = false;
        break;
      case "in_review":
        query.applicationStatus = "in_review";;
        break;
      case "selected":
        query.applicationStatus = "selected";
        break;
      case "rejected":
        query.applicationStatus = "rejected";
        break;
      default:
      // break;
    }
    const jobs = await Job.find(query).sort({createdAt: -1});

    return res.json({
      count: jobs.length,
      jobs
    });
   
  } catch (error) {
    console.error("Unified Filter Error:", error);
    res.status(500).json({error: "Failed to fetch jobs"});
  }
};

// --------------------------------------------------
// 5) get single job 
// --------------------------------------------------
export const getSingleJob = async (req , res) => {
  try {
    const userId = req.user?.userId;
    const { jobId } = req.params;

    if(!userId){
      return res.status(401).json({error: "Unauthorized"});
    }

    if(!jobId){
      return res.status(400).json({error: "Job Id is required"});
    }

    const job = await Job.findOne({_id:jobId , userId});

    if(!job){
      return res.status(404).json({error: "Job not found or unauthorized"})
    }

    return res.json({
      message: "Job details fetched successfully",
      job
    });

  } catch (error) {
    console.error("Get single Job Error", error);
    res.status(500).json({error: "Failed to fetch job details"});
  }
};

// --------------------------------------------------
// 6) delete a particular job 
// --------------------------------------------------
export const deleteJob = async (req , res) => {
  try {
    const userId = req.user?.userId;
    const { jobId } = req.params;

    if(!userId){
      return res.status(401).json({error: "unauthorized"});
    }
    if(!jobId){
      return res.status(400).json({error: "Job Id is required"});
    }

    const job = await Job.findOneAndDelete({_id:jobId , userId});
    
    if(!job){
      return res.status(404).json({error: "Job not found or unauthorized"})
    }

    return res.json({
      message: "Job deleted successfully",
      deleteJob: jobId
    })
  } catch (error) {
    console.error("Delete Job Error" , error);
    res.status(500).json({error: "Failed to delete job"});
  }
};