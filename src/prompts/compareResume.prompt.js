export const compareResumePrompt = (resumeText, jobDescription) => `
Compare the following resume with the job description.

RETURN STRICTLY A VALID JSON IN THE FOLLOWING FORMAT ONLY:

{
  "resumeScore": number,
  "matchedSkills": [],
  "missingSkills": [],
  "matchedKeywords": [],
  "missingKeywords": [],
  "recommendations": "",
  "overallSummary": ""
}

Resume:
${resumeText}

Job Description:
${jobDescription}
`;
