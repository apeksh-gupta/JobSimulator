import { extractResumeText } from "../utils/resumeExtractor.js";
import { getAIResumeComparison } from "../utils/aiCompare.js";
import { UserProfile } from "../models/userProfile.js"; 

export const compareResumeContoller = async (req, res) => {
  try {
    const { jobDescription } = req.body;
    
    // 1. Log the User ID to ensure Middleware is working
    // (Checks both 'userId' and '_id' to be safe)
    const authUserId = req.user?.userId || req.user?._id; 
    console.log(`🔎 Request from User ID: ${authUserId}`);

    if (!authUserId) {
      return res.status(401).json({ error: "Unauthorized: Token missing User ID" });
    }

    if (!jobDescription) {
      return res.status(400).json({ error: "Job Description is required" });
    }

    // 2. Fetch Profile from Database
    const userProfile = await UserProfile.findOne({ userId: authUserId });

    // 3. Debug Database Result
    if (!userProfile) {
      console.error("❌ Profile not found in DB for this ID");
      return res.status(404).json({ error: "User Profile not found" });
    }

    if (!userProfile.resumeUrl) {
      console.error("❌ Resume URL is empty in DB");
      return res.status(404).json({ error: "No resume found. Please upload one in Profile." });
    }

    console.log(`📂 Found Resume URL: ${userProfile.resumeUrl}`);

    // 4. Attempt Text Extraction
    console.log("⏳ Extracting text...");
    const resumeText = await extractResumeText(userProfile.resumeUrl);
    console.log("✅ Text Extracted (Length):", resumeText.length);

    // 5. Attempt AI Comparison
    console.log("🤖 Sending to Gemini...");
    const result = await getAIResumeComparison(resumeText, jobDescription);
    console.log("✅ AI Result Received");
  
    res.status(200).json(result);
    
  } catch (error) {
    // -------------------------------------------------------------
    // THIS IS THE MOST IMPORTANT PART
    // It prints the REAL error to your terminal
    // -------------------------------------------------------------
    console.error("❌ CRASH DETAILS:", error.message);
    if (error.response) {
        console.error("🌐 API Response Data:", error.response.data);
    }
    
    // Send the detail to Frontend so you can see it in Console/Network tab
    res.status(500).json({ 
        error: "Resume Comparison Failed", 
        details: error.message 
    });
  }
};