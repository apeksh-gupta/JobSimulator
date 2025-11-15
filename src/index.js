import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import jobRoutes from "./routes/jobRoutes.js";


dotenv.config()

const app = express();
app.use(cors());
app.use(express.json())
app.use("/api/jobs" , jobRoutes)

connectDB()

app.get("/" , (req, res)=> {
  res.send("Ai Job Agent Backend Running Successfully")
})

const PORT = process.env.PORT || 5000
app.listen(PORT , ()=> console.log(`Sever running on port ${PORT}`))