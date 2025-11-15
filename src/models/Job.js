import mongoose from "mongoose";
const jobSchema = new mongoose.Schema({
  title: {
    type: String
  },
  company: {
    type: String
  },
  location: {
    type: String
  },
  skills: {
    type: [String]
  },
  description: {
    type: String
  },
  link: {
    type: String
  },
  scrappedFrom: {
    type: String
  },
  postedAt: {
    type: Date,
    default: Date.now
  }
},  {timestamps: true}
)

export const Job = mongoose.model("Job" , jobSchema)