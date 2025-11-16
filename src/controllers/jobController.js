import dotenv from "dotenv";
dotenv.config();
import { json } from "express";
import { Job } from "../models/Job.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


export const extractJobAI = async(req , res) => {
  try {
    const { mainText, metaDescription, pageTitle, jobUrl } = req.body;

    if(!mainText || !jobUrl) {
      return res.status(400).json({error: "mainText and jobUrl are requires"})
    }
     const prompt = `
      You are an expert job extraction assistant.
      Extract job details from the given text.

      Return ONLY valid JSON in this format:
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

      If any field is missing, return empty values.
      Do NOT include any notes, explanation, or extra text.

      RAW INPUT:
      Title: ${pageTitle}
      Meta: ${metaDescription}
      Text: ${mainText}
      URL: ${jobUrl}
      `;
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash"});
    const result= await model.generateContent(prompt);

    let text = result.response.text();
    text = text.replace(/```json|```/g, "").trim();

    let extracted ;

    try {
      extracted = JSON.parse(text);
    } catch (error) {
      return res.status(500).json({
       error: "AI return invaild JSON",
       rawResponse : text
      })
    }
    const jobData = {
      ...extracted,
      jobUrl,
      source: new URL(jobUrl).hostname,
      rawText: mainText,
      status: "parsed",
      llmVersion: "gemini-2.5-flash"
    }

    const job = new Job(jobData)
    await job.save()

    return res.status(201).json({
      message: "Job extracted and saved",
      job
    });
  } catch (error) {
    console.log("AI Extract Error" , error)
    res.status(500).json({error: "server errrror"})
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