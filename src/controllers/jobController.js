import { Job } from "../models/Job.js";

export const addJob = async (req, res) => {
  try {
    const newJob = new Job(req.body);
    await newJob.save();
    res.status(201).json({message: "Job saved successfully"});
  } catch (error) {
    res.status(500).json({error: "Failed to save job"});
  }
}

export const getAllJobs = async(req,res) => {
  try {
    const jobs = await Job.find().sort({timestamp: -1});
    res.json(jobs)
  }catch (error) {
    res.status(500).json({error: "Failed to Fetch Jobs"});
  }
} 