import dotenv from "dotenv";
dotenv.config()
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import helmet from "helmet";
import bodyParser from "body-parser";

import jobRoutes from "./routes/jobRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import resumeScoreRoute from "./routes/resumeScore.route.js";
import autoApplyRoutes from "./routes/autoApplyRoutes.js";

connectDB()

const app = express();
app.use(cors());
app.use(express.json())

app.use("/api/jobs" , jobRoutes)
app.use("/api/auth", authRoutes);
app.use("/api" , profileRoutes )
app.use("/api/ai"  , resumeScoreRoute)
app.use("/api/auto-apply",autoApplyRoutes );


app.get("/" , (req, res)=> {
  res.send("Ai Job Agent Backend Running Successfully")
})

const PORT = process.env.PORT || 5000
app.listen(PORT , ()=> console.log(`Sever running on port ${PORT}`))