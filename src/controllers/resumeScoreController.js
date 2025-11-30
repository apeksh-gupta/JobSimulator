import { extractResumeText } from "../utils/resumeExtractor.js";
import { getAIResumeComparison } from "../utils/aiCompare.js";

export const compareResumeContoller = async (req  , res) => {
  try {
    const {resumeUrl , jobDescription} = req.body;

    if(!resumeUrl || !jobDescription) {
      return res.status(400).json({error: "Missing Fields"});
    } 
    const resumeText = await extractResumeText(resumeUrl);

    const result = await getAIResumeComparison(resumeText , jobDescription);
  
    res.status(200).json(result);
    
  } catch (error) {
    console.log("Contoller Error");
    res.status(500).json({error: "Resume Comparison Failed"});
  }
};