// import { extractResumeText } from "../utils/resumeExtractor.js";
// import { getAIResumeComparison } from "../utils/aiCompare.js";
// export const compareResumeContoller = async (req  , res) => {
//   try {
//     const {resumeUrl , jobDescription} = req.body;

//     if(!resumeUrl || !jobDescription) {
//       return res.status(400).json({error: "Missing Fields"});
//     } 
//     const resumeText = await extractResumeText(resumeUrl);

//     const result = await getAIResumeComparison(resumeText , jobDescription);
  
//     res.status(200).json(result);
    
//   } catch (error) {
//     console.log("Contoller Error");
//     res.status(500).json({error: "Resume Comparison Failed"});
//   }
// };



import { extractResumeText } from "../utils/resumeExtractor.js";
import { getAIResumeComparison } from "../utils/aiCompare.js";
// Make sure this path points to where you saved the userSchema file
import { UserProfile } from "../models/userProfile.js";

export const compareResumeContoller = async (req, res) => {
  try {
    // 1. We only need Job Description from the frontend now
    const { jobDescription } = req.body;
    
    // 2. Get the logged-in User's Auth ID
    // (Ensure your authMiddleware is used on this route)
    // Change ._id to .userId to match your token payload
    const authUserId = req.user?.userId;    

    if (!jobDescription) {
      return res.status(400).json({ error: "Job Description is required" });
    }

    if (!authUserId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // 3. Find the UserProfile linked to this Auth ID
    // Your schema uses 'userId' to reference the UserAuth collection
    const userProfile = await UserProfile.findOne({ userId: authUserId });

    // 4. Validate Resume Existence
    if (!userProfile || !userProfile.resumeUrl) {
      return res.status(404).json({ 
        error: "Resume not found. Please upload it in your Profile section first." 
      });
    }

    console.log(`Analyzing resume for user: ${userProfile.name}`);

    // 5. Extract Text (Your extractor handles the Google Drive link conversion)
    const resumeText = await extractResumeText(userProfile.resumeUrl);

    // 6. Get AI Score
    const result = await getAIResumeComparison(resumeText, jobDescription);
  
    res.status(200).json(result);
    
  } catch (error) {
    console.error("Controller Error:", error.message);
    res.status(500).json({ error: "Resume Comparison Failed" });
  }
};