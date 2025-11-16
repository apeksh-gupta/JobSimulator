import mongoose from "mongoose";

const userAuthSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true 
  }, 
  email: {
    type: String,
    required: true,
    unique: true 
  },
  password: {
    type: String,
    required: true
  }

}, {timestamps: true});

export const UserAuth = new mongoose.model("UserAuth" , userAuthSchema);


