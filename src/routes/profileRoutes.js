import express from "express"
import { 
  getUserProfile, 
  updateUserProfile, 
  createUserProfile,
} from "../controllers/userController.js";
import {authMiddleware} from "../middleware/authMiddleware.js"


const profileRoutes = express.Router()

// create user route is missing
profileRoutes.post("/profile/create", authMiddleware, createUserProfile);
profileRoutes.get("/profile", authMiddleware, getUserProfile);
profileRoutes.put("/profile/update", authMiddleware, updateUserProfile);


export default profileRoutes;