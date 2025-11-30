import dotenv from "dotenv";
dotenv.config();

import { GoogleGenerativeAI, GoogleGenerativeAIError } from "@google/generative-ai";
import { compareResumePrompt } from "../prompts/compareResume.prompt.js"
import { cleanJsonString } from "./cleanJson.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
 
export const getAIResumeComparison = async(resumetext , jobDescription) => {
  try {
    const model = genAI.getGenerativeModel({model : "gemini-2.5-flash"})

    const prompt = compareResumePrompt(resumetext , jobDescription);

    const result = await model.generateContent(prompt);

    let output = result.response.text();

    // Clean output using our util
    const safeJsonString = cleanJsonString(output);

    // Parse safely
    const json = JSON.parse(safeJsonString);

    return json;

  } catch (error) {
    console.log("Ai Service Error;", error);
    throw new Error("AI comparison Failed");
  }
};