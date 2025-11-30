import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import jobRoutes from "./routes/jobRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import resumeScoreRoute from "./routes/resumeScore.route.js";

dotenv.config()
connectDB()

const app = express();
app.use(cors());
app.use(express.json())

app.use("/api/jobs" , jobRoutes)
app.use("/api/auth", authRoutes);
app.use("/api" , profileRoutes )
app.use("/api/ai"  , resumeScoreRoute)

app.get("/" , (req, res)=> {
  res.send("Ai Job Agent Backend Running Successfully")
})

const PORT = process.env.PORT || 5000
app.listen(PORT , ()=> console.log(`Sever running on port ${PORT}`))