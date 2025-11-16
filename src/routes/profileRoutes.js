import express from "express"

const profileRoutes = express.Router()

// create user route is missing
profileRoutes.get("/profile", authMiddleware, getUserProfile);
profileRoutes.put("/profile/update", authMiddleware, updateUserProfile);


profileRoutes.post("/education" , authmiddleware , addOrUdateEducation)

