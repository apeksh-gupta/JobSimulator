import mongoose from "mongoose";
import mnngoose from "mongoose";
import {v4 as uuidv4} from "uuid";

const userAuthSchema = new mongoose.Schema({
  userId: {
    type: String,
    default: uuidv4,
    unique: true
  },
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


