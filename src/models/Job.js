import mongoose from "mongoose";
const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    default: ""
  },
  company: {
    type: String,
    default: ""
  },
  location: {
    type: String,
    default: ""
  },

  jobType: {
    type: String,
    default: ""
  },
  experience: {
    type: String,
    default: ""
  },
  seniority: {
    type: String,
    default: ""
  },

  salary: {
    type: String,
    default: ""
  },
  skills: {
    type: [String]
  },
  description: {
    type: String
  },
  jobUrl: {
    type: String,
    required: true
  },
  source: {
    type: String
  },
  rawText: {
    type: String
  },
  llmVersion: {
    type: String, 
    default: "gemini-1.5-flash" },

  scrapedAt: { 
    type: Date, 
    default: Date.now }
    
},  {timestamps: true}
)

export const Job = mongoose.model("Job" , jobSchema)