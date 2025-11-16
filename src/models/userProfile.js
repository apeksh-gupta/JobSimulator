import mongoose from "mongoose";

const EducationSchema = new mongoose.Schema({
  schoolName: {
    type: String,
    required: true
  },
  degree: {
    type: String,
    default: ""
  },
  major: {
    type: String,
    default: ""
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  percentageOrCGPA: {
    type: String
  } 
})

const ExperienceSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  role: { type: String, default: "" },
  location: {type: String , default: ""},
  startDate: { type: Date },
  endDate: { type: Date },
  description: { type: String, default: "" },    
  skillsUsed: { type: [String], default: [] }      
});


const userSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserAuth",
    required: true,
    unique: true
  },

  fullname: { type: String, required: true },

  gender: { type: String, enum: ["Male" , "Female" , "Others" , ""], default: "" },

  age: { type: Number, default: null },

  email: {type: String, default: "" },

  mobile: {type: String, default: "" },

  fullAdress: {type: String, default: "" },

  linkedin: { type: String, default: "" },
   
  github: { type: String, default: "" },
    
  portfolio: { type: String, default: "" },

  education : { type: [EducationSchema] , default: []},

  experience: {type: [ExperienceSchema] , default: []},

  resumeUrl: {type: String , default: ""},

  coverLetter: {type: String , default: ""},

  customFields: {
    type: Map,
    of: String,
    default: {}
  }
}, {timestamps: true}
);

export const  UserProfile = mongoose.model("UserProfile" , userSchema);