import express from "express"
import { deleteEducation, 
  addOrUpdateEducation, 
  getUserProfile, 
  updateUserProfile, 
  createUserProfile,
  addOrUpdateExperience,
  deleteExperience} from "../controllers/userController.js";
import {authMiddleware} from "../middleware/authMiddleware.js"


const profileRoutes = express.Router()

// create user route is missing
profileRoutes.post("/profile/create", authMiddleware, createUserProfile);
profileRoutes.get("/profile", authMiddleware, getUserProfile);
profileRoutes.put("/profile/update", authMiddleware, updateUserProfile);


profileRoutes.post("/profile/education" , authMiddleware , addOrUpdateEducation)
profileRoutes.delete("/profile/education/:eduId" , authMiddleware , deleteEducation)

profileRoutes.post("/profile/experience", authMiddleware, addOrUpdateExperience);
profileRoutes.delete("/profile/experience/:expId", authMiddleware, deleteExperience);

export default profileRoutes;